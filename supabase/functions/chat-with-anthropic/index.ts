
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

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
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      throw new Error('Configuration error: OPENAI_API_KEY not found')
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

    console.log('Calling OpenAI API with message:', body.message)

    // Call OpenAI API with better error handling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: "Tu es un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité. Adopte un ton professionnel adapté à l'éducation nationale et fournis des réponses détaillées et précises."
        }, {
          role: 'user',
          content: body.message
        }],
        temperature: 0.7,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    return new Response(JSON.stringify({ 
      response: data.choices[0].message.content
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error in chat function:', error)
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
