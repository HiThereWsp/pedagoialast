
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
Ton objectif est de générer des exercices pertinents, clairs et adaptés au niveau demandé, avec une attention particulière à la progression pédagogique.

Format de réponse STRICT à suivre :

FICHE ÉLÈVE
- Titre de la séquence
- Objectifs d'apprentissage clairement énoncés
- Exercices numérotés avec consignes précises
- Espace de réponse clairement délimité
- Conseils méthodologiques si nécessaire

FICHE CORRECTION ÉLÈVE
- Corrections détaillées pas à pas
- Explications adaptées au niveau
- Méthodes et astuces pour comprendre
- Points clés à retenir
- Auto-évaluation suggérée

FICHE PÉDAGOGIQUE
- Objectifs pédagogiques détaillés
- Prérequis nécessaires
- Points d'attention particuliers
- Suggestions de différenciation
- Erreurs courantes à anticiper
- Critères d'évaluation
- Prolongements possibles`
}

function buildPrompt(params: GenerationParams): Message[] {
  const messages: Message[] = [
    {
      role: 'system',
      content: buildSystemPrompt()
    }
  ]

  let userPrompt = `Je souhaite créer ${params.numberOfExercises} exercices de ${params.subject} pour une classe de ${params.classLevel}.

CONTEXTE PÉDAGOGIQUE :
- Objectif pédagogique : ${params.objective}
${params.exerciseType ? `- Type d'exercice souhaité : ${params.exerciseType}` : ''}
${params.additionalInstructions ? `- Instructions spécifiques : ${params.additionalInstructions}` : ''}

${params.specificNeeds ? `ADAPTATIONS PÉDAGOGIQUES :
- Besoins spécifiques : ${params.specificNeeds}
${params.studentProfile ? `- Profil de l'élève : ${params.studentProfile}` : ''}
${params.learningDifficulties ? `- Difficultés d'apprentissage : ${params.learningDifficulties}` : ''}` : ''}

FORMAT DEMANDÉ :
- ${params.numberOfExercises} exercices
- ${params.questionsPerExercise} questions par exercice
- Progression logique dans la difficulté
- Exercices courts et ciblés`

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
    console.log('🔵 Début de la génération:', {
      subject: params.subject,
      classLevel: params.classLevel,
      numberOfExercises: params.numberOfExercises,
      timestamp: new Date().toISOString()
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
        temperature: 0.3, // Réduit pour plus de précision
        max_tokens: 1500, // Optimisé pour la concision
        top_p: 0.9 // Ajouté pour plus de cohérence
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erreur Mistral AI:', error)
      throw new Error(`Erreur API Mistral: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Log des métriques de génération
    const endTime = Date.now()
    const duration = endTime - startTime
    console.log('✅ Génération réussie:', {
      duration_ms: duration,
      estimated_tokens: content.length / 4, // Estimation approximative
      subject: params.subject,
      timestamp: new Date().toISOString()
    })

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
