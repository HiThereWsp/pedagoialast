import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    const { classLevel, totalSessions, subject, text, additionalInstructions } = await req.json()
    console.log('Received request with:', { classLevel, totalSessions, subject, text, additionalInstructions })

    if (!classLevel || !totalSessions) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'classLevel and totalSessions are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construire le prompt de base
    let prompt = `En tant qu'expert en pédagogie à l'éducation nationale, crée une séquence pédagogique détaillée pour le niveau ${classLevel} en ${totalSessions} séances.`

    // Ajouter le sujet s'il est fourni
    if (subject) {
      prompt += `\nLe sujet est: ${subject}.`
    }

    // Ajouter le texte s'il est fourni
    if (text) {
      prompt += `\nBasé sur ce texte: ${text}.`
    }

    // Ajouter les instructions supplémentaires si fournies
    if (additionalInstructions) {
      prompt += `\nInstructions supplémentaires: ${additionalInstructions}.`
    }

    // Ajouter le format de réponse souhaité
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

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pédagogie qui aide à créer des séquences pédagogiques détaillées et structurées, en respectant scrupuleusement les programmes officiels de l\'Education Nationale.'
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

    return new Response(
      JSON.stringify({ 
        lessonPlan,
        metrics: {
          contentLength: lessonPlan.length
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the lesson plan'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})