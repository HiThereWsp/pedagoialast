import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

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
    console.log('Received request:', { message, type })

    if (!message) {
      console.error('No message provided')
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    let systemPrompt = ""
    if (type === 'lesson-plan') {
      systemPrompt = `Tu es un assistant pédagogique expert en création de séquences pédagogiques.
      Tu vas créer une séquence pédagogique détaillée et structurée qui comprend :
      1. Les objectifs d'apprentissage
      2. Les compétences visées
      3. Le matériel nécessaire
      4. Le déroulé détaillé de la séquence avec la durée estimée pour chaque partie
      5. Les activités d'évaluation
      6. Des suggestions d'adaptations pour différents niveaux
      Assure-toi que la séquence soit adaptée au niveau demandé et qu'elle soit engageante pour les élèves.`
    }

    console.log('Sending request to OpenAI with system prompt:', systemPrompt)

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    console.log('Received response from OpenAI')

    const response = completion.data.choices[0].message?.content || "Désolé, je n'ai pas pu générer de réponse."

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in chat-with-openai function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la génération de la séquence',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})