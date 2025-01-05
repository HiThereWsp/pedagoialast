import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

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

    const systemPrompt = type === 'lesson-plan'
      ? `Tu es un assistant pédagogique expert en création de séquences pédagogiques. 
         Tu dois créer des séquences détaillées et structurées qui incluent :
         - Les objectifs d'apprentissage
         - Le niveau ciblé
         - Le matériel nécessaire
         - Le déroulé détaillé des séances
         - Les évaluations
         - Les adaptations possibles
         Sois précis et pratique dans tes suggestions.`
      : type === 'title-generation'
        ? "Tu es un assistant qui génère des titres courts et concis (maximum 5 mots) pour des conversations. Réponds uniquement avec le titre, sans ponctuation ni guillemets."
        : "Tu es un assistant pédagogique français qui aide les utilisateurs à apprendre et à comprendre des concepts. Tu es amical et encourageant."

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
        max_tokens: 2000,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API')
    }

    const aiResponse = data.choices[0].message.content

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})