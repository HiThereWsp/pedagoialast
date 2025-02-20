
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// Types pour Mistral AI
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerationParams {
  subject: string;
  classLevel: string;
  numberOfExercises: number;
  questionsPerExercise: number;
  objective: string;
  exerciseType?: string;
  additionalInstructions?: string;
  specificNeeds?: string;
  originalExercise?: string;
  studentProfile?: string;
  learningDifficulties?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildSystemPrompt(): string {
  return `Tu es un assistant pédagogique expert dans la création d'exercices scolaires adaptés au système éducatif français.
Ton objectif est de générer des exercices pertinents, clairs et adaptés au niveau demandé.
Format de réponse attendu :
1. Une fiche élève contenant les exercices
2. Une fiche pédagogique pour l'enseignant contenant les corrections et des conseils`
}

function buildPrompt(params: GenerationParams): Message[] {
  const messages: Message[] = [
    {
      role: 'system',
      content: buildSystemPrompt()
    }
  ]

  let userPrompt = `Crée ${params.numberOfExercises} exercices de ${params.subject} pour une classe de ${params.classLevel}.
Objectif pédagogique : ${params.objective}
${params.exerciseType ? `Type d'exercice souhaité : ${params.exerciseType}` : ''}
${params.additionalInstructions ? `Instructions supplémentaires : ${params.additionalInstructions}` : ''}
${params.specificNeeds ? `Besoins spécifiques : ${params.specificNeeds}` : ''}
${params.studentProfile ? `Profil de l'élève : ${params.studentProfile}` : ''}
${params.learningDifficulties ? `Difficultés d'apprentissage : ${params.learningDifficulties}` : ''}`

  messages.push({
    role: 'user',
    content: userPrompt
  })

  return messages
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  try {
    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY')
    if (!MISTRAL_API_KEY) {
      throw new Error('Clé API Mistral non configurée')
    }

    const params = await req.json()
    console.log('🔵 Paramètres reçus:', {
      ...params,
      MISTRAL_API_KEY: '***' // Masquer la clé dans les logs
    })

    // Validation des paramètres requis
    if (!params.subject || !params.classLevel || !params.objective) {
      throw new Error('Paramètres requis manquants')
    }

    const messages = buildPrompt(params)

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: messages,
        temperature: 0.4, // Température réduite pour plus de cohérence
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erreur Mistral AI:', error)
      throw new Error(`Erreur API Mistral: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    console.log('✅ Exercices générés en', Date.now() - startTime, 'ms')

    return new Response(
      JSON.stringify({ exercises: content }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la génération des exercices', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
