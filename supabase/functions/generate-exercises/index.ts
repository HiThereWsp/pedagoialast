import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      subject, 
      classLevel, 
      numberOfExercises, 
      questionsPerExercise,
      objective, 
      exerciseType, 
      additionalInstructions,
      specificNeeds,
      strengths,
      challenges,
      originalExercise,
      studentProfile,
      learningDifficulties,
      learningStyle
    } = await req.json()

    let prompt = ""
    
    if (originalExercise) {
      // Prompt pour la différenciation
      prompt = `Adaptez cette activité selon les paramètres suivants :

CADRE PÉDAGOGIQUE
----------------
Activité initiale : "${originalExercise}"
Discipline : "${subject}"
Niveau : "${classLevel}"
Objectif visé : "${objective}"

ÉLÉMENTS DE CONTEXTUALISATION
---------------------------
Situation de l'élève : "${studentProfile}"
Mode d'apprentissage privilégié : "${learningStyle}"
${learningDifficulties ? `Points de vigilance : "${learningDifficulties}"` : ''}

FORMAT ATTENDU :

ACTIVITÉ 
--------
Consigne : 
Support de travail : 
Questions :
1.
2.
etc.

ACCOMPAGNEMENT PÉDAGOGIQUE
------------------------
Stratégies mises en œuvre :
- Aménagement 1 : [justification]
- Aménagement 2 : [justification]
etc.

RESSOURCES COMPLÉMENTAIRES
------------------------
[Outils d'aide proposés]`
    } else {
      // Prompt pour la génération
      prompt = `Créez ${numberOfExercises} exercices en ${subject} pour le niveau ${classLevel} sur l'objectif : ${objective}
${exerciseType ? `Type d'exercice souhaité : ${exerciseType}` : ''}
${questionsPerExercise ? `Nombre de questions par exercice : ${questionsPerExercise}` : 'Nombre de questions adapté selon pertinence'}

Éléments contextuels :
${specificNeeds ? `Besoins spécifiques : ${specificNeeds}` : ''}
${strengths ? `Points forts/centres d'intérêt : ${strengths}` : ''}
${challenges ? `Points de vigilance : ${challenges}` : ''}
${additionalInstructions ? `Consignes particulières : ${additionalInstructions}` : ''}

FORMAT ATTENDU :

SÉQUENCE PÉDAGOGIQUE
-------------------
Exercice 1
Consigne : 
Questions :
1.
2.
etc.

[Répéter selon nombre demandé]

ÉLÉMENTS POUR L'ÉQUIPE PÉDAGOGIQUE
--------------------------------
Exercice 1
1. [Réponse]
   Explicitation : 
   Points d'attention :
2. [Réponse]
   Explicitation :
   Points d'attention :
etc.

Prolongements possibles :
-`
    }

    console.log('Calling OpenAI with prompt:', prompt)

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
            content: 'Tu es un expert en pédagogie spécialisé dans la différenciation pédagogique. Tu aides à créer des exercices adaptés aux besoins spécifiques des élèves tout en respectant les programmes officiels de l\'Education Nationale.'
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