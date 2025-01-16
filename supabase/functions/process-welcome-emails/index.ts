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
    const { userId, email, firstName } = await req.json()
    console.log('📧 Processing welcome email for:', { userId, email, firstName })

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured')
    }

    console.log('📤 Sending email via Brevo API...')
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: 'PedagoIA',
          email: 'contact@pedagoia.fr'
        },
        to: [{
          email: email,
          name: firstName || 'Utilisateur'
        }],
        templateId: 8,
        params: {
          FIRSTNAME: firstName || 'Utilisateur'
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

    const result = JSON.parse(responseText)
    console.log('✅ Email sent successfully:', result)

    // Mettre à jour le statut dans la base de données
    const { error: updateError } = await supabase
      .from('welcome_emails')
      .update({
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating email status:', updateError)
      throw updateError
    }

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Error in process-welcome-emails:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })

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