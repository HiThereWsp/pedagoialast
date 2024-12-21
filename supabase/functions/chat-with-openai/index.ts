import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const MONTHLY_TOKEN_LIMIT = 100000 // Limite de 100k tokens par mois

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
    const { message, type } = await req.json()

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Si c'est une génération de titre, on utilise un prompt système spécifique
    const systemPrompt = type === 'title-generation'
      ? "Tu es un assistant qui génère des titres courts et concis (maximum 5 mots) pour des conversations. Réponds uniquement avec le titre, sans ponctuation ni guillemets."
      : "Tu es un assistant pédagogique français qui aide les utilisateurs à apprendre et à comprendre des concepts. Tu es amical et encourageant."

    console.log('Calling OpenAI API with message:', message)

    // Calculer une estimation approximative des tokens pour ce message
    const estimatedTokens = Math.ceil((message.length + systemPrompt.length) / 4)

    // Vérifier si le message dépasserait la limite mensuelle
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
        max_tokens: Math.min(1000, MONTHLY_TOKEN_LIMIT - estimatedTokens), // S'assurer de ne pas dépasser la limite
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('Successfully got response from OpenAI')

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