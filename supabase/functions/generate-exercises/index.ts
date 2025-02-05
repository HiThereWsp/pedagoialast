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
      challenges,
      originalExercise,
      studentProfile,
      learningDifficulties,
      learningStyle
    } = await req.json()

    let prompt = ""
    
    if (originalExercise) {
      // Prompt pour la différenciation
      prompt = `Adaptez cette activité selon le contexte suivant :

SITUATION PÉDAGOGIQUE
--------------------
Activité de départ : "${originalExercise}"
Discipline : "${subject}"
Niveau : "${classLevel}"
Objectif d'apprentissage : "${objective}"

CONTEXTE D'APPRENTISSAGE
-----------------------
Observations de l'élève : "${studentProfile}"
${learningStyle ? `Modalités d'apprentissage privilégiées : "${learningStyle}"` : ''}
${learningDifficulties ? `Points de vigilance particuliers : "${learningDifficulties}"` : ''}

FORMAT ATTENDU :

FICHE ÉLÈVE
-----------
Consigne : 
Questions :
1.
2.
etc.

FICHE PÉDAGOGIQUE
----------------
PRÉPARATION :
- Matériel nécessaire :
- Organisation spatiale :
- Temps estimé :

ACCOMPAGNEMENT :
1. [Question 1]
   • Réponse attendue :
   • Étayage possible :
   • Indices progressifs :
   • Alternatives acceptables :

2. [Question 2]
   [Même structure]

OBSERVATIONS POUR LE SUIVI :
- Points d'attention :
- Indicateurs de réussite :
- Prolongements possibles :

OUTILS COMPLÉMENTAIRES :
- Supports spécifiques :
- Aides méthodologiques :`
    } else {
      // Prompt pour la génération
      prompt = `Créez ${numberOfExercises} exercices en ${subject} pour le niveau ${classLevel}.
Objectif pédagogique : ${objective}
${exerciseType ? `Type d'exercice attendu : ${exerciseType}` : ''}
${questionsPerExercise ? `Nombre de questions par exercice : ${questionsPerExercise}` : 'Nombre de questions adapté selon pertinence'}

Contexte d'enseignement :
${specificNeeds ? `Besoins spécifiques : ${specificNeeds}` : ''}
${challenges ? `Points de vigilance : ${challenges}` : ''}
${additionalInstructions ? `Consignes particulières : ${additionalInstructions}` : ''}

FORMAT ATTENDU :

FICHE ÉLÈVE
-----------
Exercice 1
Consigne : 
Questions :
1.
2.
etc.

[Répéter selon nombre demandé]

FICHE PÉDAGOGIQUE
----------------
PRÉPARATION :
- Matériel nécessaire :
- Durée conseillée :
- Prérequis :

CORRIGÉ ET AIDE À L'ACCOMPAGNEMENT :
Exercice 1
1. [Réponse]
   Explicitation : 
   Points de vigilance :
   Remédiations possibles :
2. [Réponse]
   Explicitation :
   Points de vigilance :
   Remédiations possibles :
etc.

CONSEILS DE MISE EN ŒUVRE :
- Organisation : 
- Étayage possible :
- Indices progressifs :`
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