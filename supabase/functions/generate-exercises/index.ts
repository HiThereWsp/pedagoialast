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
      prompt = `En tant qu'expert en pédagogie et en différenciation, adapte cet exercice pour un élève avec le profil suivant :

      Exercice original : "${originalExercise}"
      Matière : "${subject}"
      Niveau : "${classLevel}"
      Objectif pédagogique : "${objective}"
      Profil de l'élève : "${studentProfile}"
      Style d'apprentissage : "${learningStyle}"
      ${learningDifficulties ? `Difficultés d'apprentissage spécifiques : "${learningDifficulties}"` : ''}

      Adapte l'exercice en :
      1. Prenant en compte les difficultés spécifiques mentionnées
      2. Ajustant le format selon le style d'apprentissage
      3. Maintenant l'objectif pédagogique tout en adaptant la difficulté
      4. Fournissant des supports ou aides spécifiques si nécessaire`
    } else {
      // Prompt pour la génération
      prompt = `En tant qu'expert en pédagogie, crée ${numberOfExercises} exercices pour la matière "${subject}" destinés à des élèves de niveau "${classLevel}". 
      Ces exercices doivent correspondre à l'objectif suivant : "${objective}". 
      ${exerciseType ? `Le type d'exercice souhaité est : "${exerciseType}".` : ''}
      ${questionsPerExercise ? `Chaque exercice doit contenir ${questionsPerExercise} questions.` : 'Adapte le nombre de questions selon ce qui est le plus pertinent pour atteindre l\'objectif.'}
      
      ${specificNeeds ? `Besoins spécifiques à prendre en compte : ${specificNeeds}` : ''}
      ${strengths ? `Forces et intérêts de l'élève : ${strengths}` : ''}
      ${challenges ? `Défis et obstacles à considérer : ${challenges}` : ''}
      ${additionalInstructions ? `Instructions supplémentaires : ${additionalInstructions}` : ''}
      
      Format des exercices :
      - Chaque exercice doit être clair et adapté au niveau de la classe
      - Fournir une consigne précise
      - Inclure une réponse ou une solution si nécessaire
      - Adapter le format et la présentation en fonction des besoins spécifiques mentionnés
      - Exploiter les forces et intérêts indiqués pour favoriser l'engagement
      - Proposer des stratégies pour surmonter les défis mentionnés
      - IMPORTANT : Ne pas créer d'exercices nécessitant des images ou des supports visuels. Les exercices doivent pouvoir être réalisés uniquement avec du texte.`
    }

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