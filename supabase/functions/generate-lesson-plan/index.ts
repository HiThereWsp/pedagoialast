import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not found')
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { subject, webUrl, text, classLevel, additionalInstructions, totalSessions } = await req.json()

    console.log('Received request with:', { subject, webUrl, text, classLevel, additionalInstructions, totalSessions })

    if (!classLevel || !totalSessions) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: classLevel and totalSessions are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construct the base query for embedding
    let queryForEmbedding = `niveau ${classLevel} ${subject || ''} ${additionalInstructions || ''}`

    // Generate embedding for the query
    console.log('Generating embedding for query:', queryForEmbedding)
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: queryForEmbedding,
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI Embedding API error: ${embeddingResponse.statusText}`)
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // Construct the prompt based on the input type and data
    let prompt = `En tant qu'expert en pédagogie, crée une séquence pédagogique détaillée pour le niveau ${classLevel} en ${totalSessions} séances.\n`

    if (subject) {
      prompt += `Le sujet est: ${subject}.\n`
    }
    if (webUrl) {
      prompt += `Basé sur le contenu de cette page web: ${webUrl}.\n`
    }
    if (text) {
      prompt += `Basé sur ce texte: ${text}.\n`
    }
    if (additionalInstructions) {
      prompt += `Instructions supplémentaires: ${additionalInstructions}.\n`
    }

    prompt += `
    Format de la réponse souhaitée:
    1. Objectifs d'apprentissage
    2. Prérequis
    3. Durée estimée (${totalSessions} séances)
    4. Matériel nécessaire
    5. Déroulement détaillé:
       - Phase 1: Introduction
       - Phase 2: Développement
       - Phase 3: Application
       - Phase 4: Conclusion
    6. Évaluation
    7. Prolongements possibles`

    console.log('Calling OpenAI with prompt:', prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pédagogie qui aide à créer des séquences pédagogiques détaillées et structurées.'
          },
          {
            role: 'user',
            content: prompt
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
    const lessonPlan = data.choices[0].message.content

    console.log('Successfully generated lesson plan')

    return new Response(JSON.stringify({ lessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the lesson plan'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})