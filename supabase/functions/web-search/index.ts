import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const sonarApiKey = Deno.env.get('SONAR_API_KEY')

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
    if (!sonarApiKey) {
      console.error('SONAR_API_KEY is not configured')
      throw new Error('SONAR_API_KEY is not configured')
    }

    const { message } = await req.json()
    
    if (!message) {
      console.error('No message provided in request')
      throw new Error('No message provided in request')
    }

    console.log('Calling Sonar API with message:', message)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sonarApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `Vous êtes un assistant pédagogique expert qui aide les enseignants à créer du contenu pédagogique de haute qualité. Vous avez accès à des informations web actualisées via l'API Sonar.

DIRECTIVES POUR LES SOURCES :
1. Pour chaque information citée, indiquez la source avec un lien complet
2. Format des sources : "Source [1]: https://example.com"
3. Citez les sources dans le texte avec [1], [2], etc.
4. Listez toutes les sources utilisées à la fin de votre réponse
5. Privilégiez les sources officielles (education.gouv.fr, eduscol.fr)
6. Vérifiez la fiabilité des sources avant citation

STYLE DE RÉPONSE :
- Ton naturel et professionnel
- Réponses claires et structurées
- Évitez tout format robotique ou formules répétitives
- Adaptez le langage au contexte éducatif français

STRUCTURE :
1. Répondez directement à la question
2. Organisez l'information de manière logique
3. Utilisez des listes à puces pour plus de clarté
4. Incluez des exemples pratiques
5. Terminez par les sources utilisées

CONTENU :
- Fournissez des informations précises et vérifiées
- Adaptez le contenu au niveau mentionné
- Proposez des applications pratiques
- Anticipez les difficultés potentielles

SOURCES WEB :
- Évaluez la fiabilité avant citation
- Privilégiez : sources officielles > académiques > professionnelles
- Indiquez clairement l'origine des informations
- Citez les dates de publication quand disponibles`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Sonar API error:', error)
      throw new Error('Error calling Sonar API')
    }

    const data = await response.json()
    console.log('Successfully got response from Sonar')

    return new Response(JSON.stringify({ response: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in web-search function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your search request'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})