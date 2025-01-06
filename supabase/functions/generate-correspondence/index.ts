import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.14.2"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipientType, subject, context, tone, additionalInstructions } = await req.json()

    const configuration = new Configuration({ apiKey: OPENAI_API_KEY })
    const openai = new OpenAIApi(configuration)

    const prompt = `En tant que professeur, rédigez un message ${tone === 'formal' ? 'formel' : tone === 'semiformal' ? 'semi-formel' : 'cordial'} 
    destiné à ${recipientType === 'parents' ? 'des parents d\'élève' : recipientType === 'administration' ? 'l\'administration' : 'des collègues'} 
    concernant : ${subject}.

    Contexte : ${context}
    ${additionalInstructions ? `Instructions supplémentaires : ${additionalInstructions}` : ''}

    Le message doit être professionnel, clair et bien structuré. Utilisez un langage approprié au destinataire et au contexte.`

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Vous êtes un assistant spécialisé dans la rédaction de correspondances professionnelles dans le milieu éducatif."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const correspondence = completion.data.choices[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ correspondence }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})