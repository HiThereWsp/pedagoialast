
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://github.com/hexagon/deno-openai/raw/master/mod.ts"
import { corsHeaders } from "../_shared/cors.ts"

const openAI = new OpenAI(Deno.env.get('OPENAI_API_KEY') || '')

interface RequestBody {
  classLevel: string
  totalSessions: string
  subject?: string
  text?: string
  additionalInstructions?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { classLevel, totalSessions, subject, text, additionalInstructions } = await req.json() as RequestBody

    const detailedPrompt = `En tant qu'expert pédagogue, créez une séquence pédagogique détaillée pour une classe de ${classLevel} ${subject ? `en ${subject}` : ''} sur ${totalSessions} séances.

Instructions spécifiques :
1. Commencez par une introduction détaillant les objectifs d'apprentissage et les compétences visées.
2. Pour chaque séance, incluez :
   - Les objectifs spécifiques
   - Le matériel nécessaire
   - Le déroulement détaillé (mise en situation, activités, synthèse)
   - Les modalités d'évaluation
   - Les adaptations possibles pour la différenciation pédagogique
3. Décrivez précisément :
   - Le timing de chaque activité
   - Les consignes exactes à donner aux élèves
   - Les points d'attention pour l'enseignant
   - Les traces écrites attendues
4. Précisez les prolongements possibles et les liens interdisciplinaires
${text ? `\nContexte ou texte spécifique à intégrer : ${text}` : ''}
${additionalInstructions ? `\nInstructions supplémentaires : ${additionalInstructions}` : ''}

Format de sortie souhaité :
• Introduction et objectifs généraux
• Prérequis et matériel global
• Pour chaque séance :
  1. Objectifs et compétences
  2. Matériel spécifique
  3. Déroulement détaillé :
     - Phase 1 : Mise en situation (durée, modalités, consignes)
     - Phase 2 : Recherche/Activités (durée, modalités, consignes)
     - Phase 3 : Mise en commun (durée, modalités, consignes)
     - Phase 4 : Synthèse et trace écrite
  4. Évaluation et différenciation
  5. Prolongements possibles`

    console.log('Generating lesson plan with prompt:', detailedPrompt)

    const completion = await openAI.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en pédagogie française, spécialisé dans la création de séquences pédagogiques détaillées et structurées selon les programmes de l'Éducation Nationale."
        },
        {
          role: "user",
          content: detailedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3500,
    })

    console.log('Received response from OpenAI')

    const lessonPlan = completion.choices[0]?.message?.content || "Erreur de génération"

    return new Response(
      JSON.stringify({
        lessonPlan
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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
