
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { topic, tone, recipient, additionalContext } = await req.json()

    const systemPrompt = `Tu es un assistant spécialisé dans la rédaction de correspondances professionnelles en milieu scolaire.
    Tu dois générer un message ${tone} destiné à ${recipient === 'parents' ? 'des parents d\'élèves' : 
    recipient === 'director' ? 'la direction de l\'établissement' :
    recipient === 'inspector' ? 'l\'inspection académique' : 'un(e) collègue'}.
    Le message doit être professionnel, respectueux et adapté au destinataire.
    Utilise les formules de politesse appropriées en fonction du destinataire.
    Important : Sois concis et va directement à l'essentiel. La réponse ne doit pas dépasser 250-300 mots.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Sujet: ${topic}\nContexte additionnel: ${additionalContext}` }
        ],
        temperature: 0.7,
        max_tokens: 500, // Limite le nombre de tokens pour obtenir des réponses plus concises
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const data = await response.json()
    const generatedText = data.choices[0].message.content

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in generate-correspondence function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
