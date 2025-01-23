import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

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
    const { message } = await req.json()
    
    if (!message) {
      console.error('No message provided in request')
      throw new Error('No message provided in request')
    }

    console.log('Calling OpenAI with message:', message)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('Successfully got response from OpenAI')

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat-with-embeddings function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your request'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
