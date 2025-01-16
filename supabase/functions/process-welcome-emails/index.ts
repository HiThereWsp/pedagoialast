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
    // Récupérer les emails en attente
    console.log('📥 Fetching pending welcome emails...')
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('welcome_emails')
      .select('*')
      .is('sent_at', null)
      .is('error', null)
    
    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError)
      throw new Error(`Error fetching pending emails: ${fetchError.message}`)
    }

    console.log(`📝 Found ${pendingEmails?.length || 0} pending welcome emails`)
    
    if (!pendingEmails?.length) {
      return new Response(
        JSON.stringify({ message: 'No pending emails' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Traiter chaque email
    const results = await Promise.all(pendingEmails.map(async (emailData) => {
      console.log(`📧 Processing welcome email for user ${emailData.user_id}`)
      
      try {
        const emailContent = {
          sender: {
            name: 'PedagoIA',
            email: 'contact@pedagoia.fr'
          },
          to: [{
            email: emailData.email,
            name: emailData.first_name || 'Utilisateur'
          }],
          templateId: 8, // ID du template "Bienvenue ! - Confirmation (Nouveau user)"
          params: {
            FIRSTNAME: emailData.first_name || 'Utilisateur'
          }
        }

        console.log('📤 Sending email via Brevo API...')
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY!,
          },
          body: JSON.stringify(emailContent)
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ Brevo API error:', {
            status: res.status,
            statusText: res.statusText,
            error: errorText
          })
          throw new Error(`Brevo API error: ${errorText}`)
        }

        const result = await res.json()
        console.log('✅ Email sent successfully:', result)

        // Mettre à jour le statut dans la base de données
        const { error: updateError } = await supabase
          .from('welcome_emails')
          .update({
            sent_at: new Date().toISOString(),
            status: 'sent'
          })
          .eq('id', emailData.id)

        if (updateError) {
          console.error('❌ Error updating email status:', updateError)
          throw updateError
        }

        return { success: true, userId: emailData.user_id }
      } catch (error) {
        console.error('❌ Error processing email:', error)
        
        // Mettre à jour le statut d'erreur
        await supabase
          .from('welcome_emails')
          .update({
            error: error.message,
            status: 'error'
          })
          .eq('id', emailData.id)

        return { success: false, userId: emailData.user_id, error: error.message }
      }
    }))

    console.log('✨ Finished processing all emails')
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

serve(handler)