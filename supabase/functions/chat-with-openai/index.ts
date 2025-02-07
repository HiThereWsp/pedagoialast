
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const MONTHLY_TOKEN_LIMIT = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, type } = await req.json()

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = type === 'title-generation'
      ? "Tu es un assistant qui génère des titres courts et concis (maximum 5 mots) pour des conversations. Réponds uniquement avec le titre, sans ponctuation ni guillemets."
      : `Tu es un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité.

         Directives de formatage :
         1. Utilise le markdown pour structurer tes réponses
         2. **Mets en gras les points importants**
         3. Utilise des sauts de ligne pour séparer les paragraphes
         4. Utilise des listes avec des tirets (-) quand c'est pertinent

         N'oublie pas de suivre ces règles de formatage pour toutes tes réponses.
         Exemple de formatage :
         **Point important :**
         - Détail 1
         - Détail 2

         Nouveau paragraphe avec une **mise en valeur**.`

    console.log('Calling OpenAI API with message:', message)

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        max_tokens: Math.min(4000, MONTHLY_TOKEN_LIMIT - estimatedTokens),
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
