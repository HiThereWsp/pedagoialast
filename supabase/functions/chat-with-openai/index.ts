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
         1. Utilise une structure claire avec des titres et sous-titres numérotés
         2. Pour les listes, utilise des puces avec des tirets (-)
         3. Mets en gras les éléments importants avec **texte**
         4. Sépare clairement les sections avec des sauts de ligne

         Directives de contenu :
         1. Adopte un ton professionnel adapté à l'éducation nationale
         2. Fournis des réponses détaillées et précises
         3. Inclus systématiquement :
            - Les objectifs pédagogiques
            - Les critères d'évaluation
            - Le matériel nécessaire
            - Les conseils de mise en œuvre
         4. Adapte le contenu au niveau mentionné
         5. Ne fais JAMAIS référence à d'autres conversations`

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
        model: 'gpt-3.5-turbo', // Correction du nom du modèle
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
