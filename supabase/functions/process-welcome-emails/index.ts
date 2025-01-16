import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
)

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting process-welcome-emails function')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Récupérer les emails non envoyés
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('welcome_emails')
      .select('*')
      .is('sent_at', null)
      .is('error', null)

    if (fetchError) {
      throw new Error(`Error fetching pending emails: ${fetchError.message}`)
    }

    console.log(`📧 Found ${pendingEmails?.length || 0} pending welcome emails`)

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    for (const email of pendingEmails) {
      console.log(`Processing email for: ${email.email}`)
      
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY!,
          },
          body: JSON.stringify({
            sender: {
              name: 'PedagoIA',
              email: 'contact@pedagoia.fr'
            },
            to: [{
              email: email.email,
              name: email.first_name || 'Utilisateur'
            }],
            templateId: 8,
            params: {
              FIRSTNAME: email.first_name || 'Utilisateur'
            }
          })
        })

        const responseText = await res.text()
        console.log('📨 Brevo API Response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: responseText
        })

        if (!res.ok) {
          throw new Error(`Brevo API error: ${responseText}`)
        }

        // Mettre à jour le statut dans la base de données
        const { error: updateError } = await supabase
          .from('welcome_emails')
          .update({
            sent_at: new Date().toISOString(),
            status: 'sent'
          })
          .eq('id', email.id)

        if (updateError) {
          console.error('❌ Error updating email status:', updateError)
          throw updateError
        }

        console.log(`✅ Email sent successfully to ${email.email}`)
      } catch (error) {
        console.error(`❌ Error processing email ${email.id}:`, error)
        
        // Mettre à jour le statut d'erreur
        await supabase
          .from('welcome_emails')
          .update({
            error: error.message,
            status: 'error'
          })
          .eq('id', email.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: pendingEmails.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error in process-welcome-emails:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

serve(handler)