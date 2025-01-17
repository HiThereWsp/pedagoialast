import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting test-resend-email function')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📧 Attempting to send test email via Resend...')
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PedagoIA <onboarding@resend.dev>',
        to: ['test@example.com'], // Remplacez par votre email pour le test
        subject: 'Test Email - PedagoIA',
        html: `
          <h1>Bienvenue sur PedagoIA !</h1>
          <p>Ceci est un email de test pour vérifier l'intégration avec Resend.</p>
          <p>Notre assistant pédagogique intelligent est là pour vous aider à créer des contenus pédagogiques innovants et personnalisés.</p>
        `
      })
    })

    const responseText = await res.text()
    console.log('📨 Resend API Response:', {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: responseText
    })

    if (!res.ok) {
      throw new Error(`Resend API error: ${responseText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error in test-resend-email:', {
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