
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Improved CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured')
      throw new Error('Configuration error: ANTHROPIC_API_KEY not found')
    }

    // Validate request
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Error parsing request body:', e)
      throw new Error('Invalid request body')
    }

    if (!body.message) {
      throw new Error('Message is required')
    }

    console.log('Calling Anthropic API with message:', body.message)

    // Call Anthropic API with better error handling
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
          content: body.message
        }],
        system: "Tu es un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité. Adopte un ton professionnel adapté à l'éducation nationale et fournis des réponses détaillées et précises."
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API error:', errorData)
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from Anthropic:', data)

    return new Response(JSON.stringify({ 
      response: data.content[0].text
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error in chat-with-anthropic function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Une erreur est survenue lors du traitement de votre demande'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }
    })
  }
})
