import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const MONTHLY_TOKEN_LIMIT = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateSystemPrompt = (type: string, context: string) => {
  if (type === 'lesson-plan') {
    const { classLevel, additionalInstructions } = JSON.parse(context)
    return `Tu es un expert en pédagogie qui aide à créer des séquences pédagogiques détaillées. 
    Pour le niveau ${classLevel}, crée une séquence pédagogique structurée qui inclut:
    
    1. Les objectifs d'apprentissage
    2. Les prérequis nécessaires
    3. Le matériel requis
    4. Le déroulé détaillé de la séquence (introduction, développement, conclusion)
    5. Les activités d'évaluation
    6. Des suggestions d'adaptations pour différents profils d'élèves
    
    Instructions supplémentaires: ${additionalInstructions || 'Aucune'}`
  }

  // Limite le contexte aux 10 derniers échanges pour optimiser les tokens
  const exchanges = context.split('\n')
  const lastExchanges = exchanges.slice(-20)
  return lastExchanges.join('\n')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, context, type } = await req.json()
    console.log('Received request:', { messageLength: message.length, contextLength: context?.length, type })

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = generateSystemPrompt(type, context)
    const estimatedTokens = Math.ceil((message.length + systemPrompt.length) / 4)

    if (estimatedTokens > MONTHLY_TOKEN_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Limite mensuelle de tokens dépassée",
          details: "Vous avez atteint votre limite mensuelle de tokens. Réessayez le mois prochain ou passez à un forfait supérieur."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Calling OpenAI API with system prompt length:', systemPrompt.length)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: Math.min(2000, MONTHLY_TOKEN_LIMIT - estimatedTokens),
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('Successfully got response from OpenAI, length:', aiResponse.length)

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat function:', error)
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
