
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

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
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY non configurée')
    }

    const { message } = await req.json()

    console.log('Appel à Anthropic avec le message:', message)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: message
        }],
        system: "Tu es un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité. Adopte un ton professionnel adapté à l'éducation nationale et fournis des réponses détaillées et précises."
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erreur Anthropic API:', error)
      throw new Error('Erreur lors de l\'appel à l\'API Anthropic')
    }

    const data = await response.json()
    console.log('Réponse reçue d\'Anthropic:', data)

    return new Response(JSON.stringify({ 
      response: data.content[0].text
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erreur dans la fonction chat-with-anthropic:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Une erreur est survenue lors du traitement de votre demande'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

