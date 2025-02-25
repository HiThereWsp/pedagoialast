
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

  console.log('🚀 Démarrage de la fonction generate-lesson-plan')
  const startTime = Date.now()

  try {
    const { 
      subject, 
      classLevel, 
      text,
      subject_matter,
      totalSessions,
      additionalInstructions
    } = await req.json()
    
    // Validation des entrées pour éviter les prompts vides ou invalides
    if (!classLevel) {
      throw new Error('Le niveau de classe (classLevel) est requis')
    }
    
    if (!subject_matter) {
      throw new Error('La matière (subject_matter) est requise')
    }

    // Construction d'un prompt plus spécifique et contextualisé
    let prompt = `En tant qu'expert en pédagogie de l'Éducation Nationale française, créez une séquence pédagogique détaillée pour le niveau ${classLevel} en ${subject_matter}.`

    // Ajouter des détails sur la matière et le sujet spécifique
    prompt += `\n\nMatière : ${subject_matter} (${subject || 'Sujet général'})`
    prompt += `\nNombre de séances : ${totalSessions || '4'}`
    
    // Ajouter les objectifs d'apprentissage si fournis
    if (text) {
      prompt += `\n\nObjectifs d'apprentissage précis : ${text}`
    }
    
    // Ajouter des instructions supplémentaires si fournies
    if (additionalInstructions) {
      prompt += `\n\nInstructions spécifiques de l'enseignant : ${additionalInstructions}`
    }

    // Ajout d'instructions explicites pour éviter les ambiguïtés
    prompt += `\n\nATTENTION : La séquence doit être spécifiquement dans le domaine de ${subject_matter} et traiter uniquement de "${subject || 'ce sujet'}". Ne pas aborder d'autres domaines sauf si explicitement demandé.`

    prompt += `\n\nFormat souhaité de la séquence :
1. Objectifs d'apprentissage
2. Prérequis
3. Durée estimée (${totalSessions || '4'} séances)
4. Matériel nécessaire
5. Déroulement détaillé :
   - Phase 1 : Introduction
   - Phase 2 : Développement
   - Phase 3 : Application
   - Phase 4 : Conclusion
6. Évaluation
7. Prolongements possibles`

    console.log(`⏱️ Temps de préparation du prompt: ${Date.now() - startTime}ms`)
    console.log(`📝 Envoi du prompt à OpenAI pour générer une séquence en ${subject_matter} sur "${subject}"`)

    // Récupération et validation de la clé API
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      throw new Error('Clé API OpenAI manquante')
    }

    // Configuration avancée de la requête avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 secondes de timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Modèle plus rapide et efficace
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en pédagogie spécialisé dans la création de séquences pédagogiques pour l\'Education Nationale française. Tu connais parfaitement les programmes scolaires et les recommandations officielles. Tu dois créer des contenus précis, adaptés au niveau demandé et strictement dans la matière indiquée.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048, // Limiter la longueur pour éviter les timeout
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId) // Nettoyer le timeout si la requête réussit avant
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ Erreur API OpenAI (${response.status}):`, errorData)
        throw new Error(`Erreur API OpenAI: ${response.statusText}`)
      }

      const data = await response.json()
      const lessonPlan = data.choices[0].message.content

      console.log(`✅ Séquence générée avec succès en ${Date.now() - startTime}ms`)
      console.log(`📊 Taille de la séquence: ${lessonPlan.length} caractères`)

      return new Response(
        JSON.stringify({ 
          lessonPlan,
          metrics: {
            contentLength: lessonPlan.length,
            generationTimeMs: Date.now() - startTime
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (abortError) {
      clearTimeout(timeoutId)
      if (abortError.name === 'AbortError') {
        console.error('⏱️ Requête interrompue par timeout')
        throw new Error('La requête a pris trop de temps et a été interrompue')
      }
      throw abortError
    }
  } catch (error) {
    console.error('❌ Erreur dans la fonction generate-lesson-plan:', error)
    
    // Message d'erreur amélioré pour aider au débogage
    const errorMessage = error.message || 'Erreur inconnue'
    const errorDetails = error.stack || ''
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } finally {
    console.log(`🏁 Temps total d'exécution: ${Date.now() - startTime}ms`)
  }
})
