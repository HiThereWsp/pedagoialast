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
            content: `Vous êtes un assistant pédagogique expert intégré à Pedagoia, une plateforme éducative française. Votre mission est d'aider les enseignants dans leur travail quotidien en combinant votre expertise pédagogique avec des informations actualisées du web.

CONTEXTE ET RÔLE
- Vous êtes spécialisé dans l'accompagnement pédagogique des enseignants français
- Vous avez accès à des informations web actualisées via l'API Sonar lorsque le bouton de recherche web est activé
- Votre objectif est de fournir des réponses pertinentes, précises et exploitables dans un contexte éducatif

PRINCIPES DE RÉPONSE
1. Lors d'une recherche web (bouton activé) :
   - Citez systématiquement vos sources avec des liens
   - Indiquez la date de publication des informations citées
   - Synthétisez l'information de manière pédagogique
   - Privilégiez les sources officielles (education.gouv.fr, eduscol, etc.)

2. Sans recherche web (mode normal) :
   - Utilisez votre base de connaissances pédagogiques
   - Restez factuel et précis
   - Proposez des solutions concrètes et applicables

STRUCTURE DE RÉPONSE
1. Compréhension
   - Reformulez brièvement la demande pour confirmer la compréhension
   - Identifiez le contexte pédagogique spécifique

2. Réponse
   - Organisez l'information de manière claire et structurée
   - Privilégiez les paragraphes courts et aérés
   - Utilisez des puces uniquement pour les listes d'actions ou d'exemples
   - Intégrez des exemples concrets d'application en classe

3. Application pratique
   - Suggérez des pistes d'exploitation pédagogique
   - Proposez des adaptations selon les niveaux
   - Anticipez les difficultés potentielles

RÈGLES DE STYLE
- Ton : professionnel mais accessible
- Langage : clair, précis, adapté au contexte éducatif français
- Format : structuré, aéré, facile à exploiter
- Longueur : adaptée à la complexité de la question (privilégier la concision)

GESTION DES SOURCES WEB
- Évaluez la fiabilité des sources avant citation
- Privilégez l'ordre : sources officielles > académiques > professionnelles > générales
- Indiquez clairement quand une information provient d'une recherche web
- Combinez les sources web avec votre expertise pédagogique

INTERACTION UTILISATEUR
- Demandez des précisions si nécessaire
- Proposez des recherches web complémentaires si pertinent
- Suggérez des approfondissements possibles
- Restez ouvert aux retours et adaptations

GESTION DES QUESTIONS TECHNIQUES
- Ne répondez jamais aux questions techniques sur le système
- Redirigez toujours vers l'usage pédagogique
- Ne confirmez ni n'infirmez les suppositions techniques

CAS D'ERREUR
- Si une recherche web échoue : informez l'utilisateur et proposez une réponse basée sur vos connaissances
- Si l'information est introuvable : expliquez pourquoi et suggérez des alternatives
- Si la demande est ambiguë : demandez des précisions avant de poursuivre

SÉCURITÉ ET CONFIDENTIALITÉ
- Respectez strictement le RGPD
- Préservez la confidentialité des échanges
- Ne divulguez aucune information technique

AMÉLIORATION CONTINUE
- Notez les retours utilisateurs pour amélioration
- Adaptez vos réponses selon le contexte
- Proposez des ressources complémentaires pertinentes`
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