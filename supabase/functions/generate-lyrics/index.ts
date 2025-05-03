import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OpenAI-gen-Lyrics')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, params } = await req.json()

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Generating lyrics with parameters:', params)
    console.log('Using prompt:', prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // Utiliser GPT-4 pour une meilleure qualité
        messages: [
          { 
            role: 'system', 
            content: `Tu es un expert en pédagogie et en écriture de chansons.
                     Ta mission est de créer des paroles de chansons éducatives et engageantes.
                     Ces paroles doivent être adaptées au niveau scolaire ciblé, faciles à retenir et pédagogiquement efficaces.
                     Assure-toi d'intégrer clairement l'objectif d'apprentissage et d'utiliser un vocabulaire adapté à l'âge des élèves.
                     Crée une structure simple avec titre, couplets et refrain.
                     IMPORTANT: Limite la chanson à 3 couplets maximum pour plus d'efficacité.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const data = await response.json()
    let lyrics = data.choices[0].message.content

    // Nettoyer et améliorer le formatage des paroles
    lyrics = lyrics
      .replace(/\*\*/g, '') // Supprimer les marqueurs **
      .replace(/\[([^\]]+)\]/g, '$1:') // Convertir [Titre] en Titre:
      .replace(/^(Titre|Refrain|Couplet \d+)[^\w:]*:/gm, '$1:') // Normaliser les titres de sections
      .trim() // Supprimer les espaces en début et fin

    // Ajouter des sauts de ligne cohérents
    lyrics = lyrics
      .replace(/Titre:/g, 'Titre:')
      .replace(/Refrain:/g, '\n\nRefrain:')
      .replace(/Couplet \d+:/g, '\n\nCouplet $&:'.replace('Couplet Couplet', 'Couplet'))
      .trim()

    // Ajouter un titre si manquant
    if (!lyrics.startsWith('Titre:')) {
      // Si pas de titre, ajouter un titre générique
      const hasSourceText = params.fromText && params.fromText.trim().length > 0;
      if (hasSourceText) {
        lyrics = `Titre: ${params.subject} en chanson\n\n${lyrics}`;
      } else {
        lyrics = `Titre: Chanson sur ${params.subject}\n\n${lyrics}`;
      }
    }

    // Créer un titre basé sur les paramètres pour la BDD
    let title = `Chanson - ${params.subject} (${params.classLevel})`;

    const content = `Chanson pour le niveau ${params.classLevel} en ${params.subject}`;

    console.log('Successfully generated lyrics')

    return new Response(
      JSON.stringify({ 
        title: title,
        content: content,
        lyrics: lyrics,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in lyrics generation function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating lyrics'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 