import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_API_KEY = "re_cmS8JUA4_3CjcfARe8fpYZVtNuEt87mfp"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, firstName, teachingLevel } = await req.json()
    console.log('Processing welcome email for:', { email, firstName: firstName, teachingLevel })

    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PedagoIA <onboarding@resend.dev>',
        to: [email],
        subject: 'Bienvenue sur la liste d\'attente de PedagoIA !',
        html: `
          <h1>Bonjour ${firstName} !</h1>
          <p>Merci de votre intérêt pour PedagoIA. Nous sommes ravis de vous compter parmi nos futurs utilisateurs.</p>
          <p>Nous avons bien noté que vous enseignez au niveau : ${teachingLevel}</p>
          <p>Nous travaillons actuellement sur le développement de notre plateforme et nous vous tiendrons informé(e) de son lancement.</p>
          <p>À très bientôt !</p>
          <p>L'équipe PedagoIA</p>
        `
      })
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Error sending welcome email:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()
    console.log('Welcome email sent successfully:', data)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-waitlist-welcome function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process waitlist welcome email'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})