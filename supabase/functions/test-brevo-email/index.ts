import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting test-brevo-email function')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📧 Attempting to send test email via Brevo API...')
    
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
          email: 'test@example.com', // Remplacez par votre email de test
          name: 'Test User'
        }],
        templateId: 4,
        params: {
          FIRSTNAME: 'Test User'
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

    return new Response(
      JSON.stringify({ success: true, response: responseText }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('❌ Error in test-brevo-email:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

serve(handler)