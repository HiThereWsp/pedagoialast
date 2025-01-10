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

    // Construire un prompt plus concis et efficace
    let prompt = `En tant qu'expert pédagogique, crée une séquence de ${totalSessions} séances pour le niveau ${classLevel}.`

    if (subject) {
      prompt += `\nMatière: ${subject}.`
    }

    if (text) {
      prompt += `\nBasé sur: ${text}.`
    }

    if (additionalInstructions) {
      prompt += `\nInstructions: ${additionalInstructions}.`
    }

    // Structure attendue plus concise
    prompt += `
Format:
1. Objectifs
2. Prérequis
3. Matériel
4. Déroulé:${Array.from({ length: Number(totalSessions) }, (_, i) => `\n   Séance ${i + 1}:`).join('')}
5. Évaluation`

    console.log('Sending prompt to OpenAI:', prompt)

    // Appel à l'API OpenAI avec le modèle plus rapide
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
            content: 'Tu es un expert en pédagogie qui aide à créer des séquences pédagogiques détaillées et structurées, en respectant les programmes officiels de l\'Education Nationale.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        stream: true, // Activer le streaming pour une réponse progressive
      }),
    })

    // Transformer la réponse en stream
    return new Response(response.body, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

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