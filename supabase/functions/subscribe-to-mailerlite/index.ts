import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const MAILERLITE_API_KEY = Deno.env.get('MAILERLITE_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscribeRequest {
  email: string
  firstName: string
  teachingLevel?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, firstName, teachingLevel } = await req.json() as SubscribeRequest

    console.log('Subscribing to MailerLite:', { email, firstName, teachingLevel })

    if (!MAILERLITE_API_KEY) {
      throw new Error('MAILERLITE_API_KEY is not configured')
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          name: firstName,
          teaching_level: teachingLevel || '',
        },
        groups: ['101841124559586439'] // ID du groupe "Waitlist" dans MailerLite
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('MailerLite API error:', data)
      
      // Si l'email existe déjà
      if (response.status === 409) {
        return new Response(
          JSON.stringify({ error: 'Cette adresse email est déjà inscrite.' }),
          { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      throw new Error(data.message || 'Erreur lors de l\'inscription à la newsletter')
    }

    console.log('Successfully subscribed to MailerLite:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in subscribe-to-mailerlite function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors de l\'inscription' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})