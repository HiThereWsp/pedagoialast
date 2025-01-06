import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subject, classLevel, numberOfExercises, objective, exerciseType, additionalInstructions } = await req.json()

    const prompt = `En tant qu'expert en pédagogie, crée ${numberOfExercises} exercices pour la matière "${subject}" destinés à des élèves de niveau "${classLevel}". 
    Ces exercices doivent correspondre à l'objectif suivant : "${objective}". 
    Le type d'exercice souhaité est : "${exerciseType}". 
    ${additionalInstructions ? `Instructions supplémentaires : ${additionalInstructions}.` : ''}
    
    Format des exercices :
    - Chaque exercice doit être clair et adapté au niveau de la classe.
    - Fournir une consigne précise.
    - Inclure une réponse ou une solution si nécessaire.
    - Varier les types de questions pour maintenir l'intérêt des élèves.`

    console.log('Calling OpenAI with prompt:', prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pédagogie qui aide à créer des exercices détaillés et structurés, en respectant scrupuleusement les programmes officiels de l\'Education Nationale.'
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
    const exercises = data.choices[0].message.content

    console.log('Successfully generated exercises')

    return new Response(
      JSON.stringify({ exercises }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in generate-exercises function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the exercises'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})