import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const MONTHLY_TOKEN_LIMIT = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fonction utilitaire pour nettoyer et formater le contexte
const formatContext = (context: string) => {
  // Limite le contexte aux 10 derniers échanges pour optimiser les tokens
  const exchanges = context.split('\n')
  const lastExchanges = exchanges.slice(-20)
  return lastExchanges.join('\n')
}

// Fonction pour générer un prompt système plus précis
const generateSystemPrompt = (type: string, context: string) => {
  if (type === 'title-generation') {
    return "Tu es un assistant qui génère des titres courts et concis (maximum 5 mots) pour des conversations. Réponds uniquement avec le titre, sans ponctuation ni guillemets."
  }

  let prompt = `Tu es un assistant pédagogique français expert qui aide les utilisateurs à apprendre et à comprendre des concepts. 
    Instructions importantes:
    - Sois précis et concis dans tes réponses
    - Utilise des exemples concrets quand c'est pertinent
    - Structure tes réponses de manière claire
    - Adapte ton niveau de langage à celui de l'utilisateur
    - Si tu n'es pas sûr d'une information, dis-le clairement
    - Propose des ressources complémentaires si pertinent\n`

  if (context) {
    prompt += "Contexte de la conversation précédente :\n" + formatContext(context)
  }

  return prompt
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
        max_tokens: Math.min(1000, MONTHLY_TOKEN_LIMIT - estimatedTokens),
        presence_penalty: 0.6, // Encourage plus de variété dans les réponses
        frequency_penalty: 0.5, // Évite les répétitions
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