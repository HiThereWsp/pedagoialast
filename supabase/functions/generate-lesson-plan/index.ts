
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
    const { subject, classLevel, text } = await req.json()
    
    let prompt = `En tant qu'expert en pédagogie, créez une séquence pédagogique détaillée pour le niveau ${classLevel} en ${subject}.`

    if (text) {
      prompt += `\nObjectifs d'apprentissage : ${text}`
    }

    prompt += `\nFormat souhaité de la séquence :
1. Objectifs d'apprentissage
2. Prérequis
3. Durée estimée
4. Matériel nécessaire
5. Déroulement détaillé :
   - Phase 1 : Introduction
   - Phase 2 : Développement
   - Phase 3 : Application
   - Phase 4 : Conclusion
6. Évaluation
7. Prolongements possibles`

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
      throw new Error(`Erreur API OpenAI: ${response.statusText}`)
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
    console.error('Erreur dans la fonction generate-lesson-plan:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
