import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const MONTHLY_TOKEN_LIMIT = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateEmbedding = async (text: string) => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

const getResponse = (embedding: number[]) => {
  // Ici nous pouvons implémenter une logique personnalisée basée sur l'embedding
  // Par exemple, comparer avec une base de réponses pré-définies
  // Pour l'instant, nous retournons une réponse simple
  return "Je suis Élia, votre assistante pédagogique. Je peux vous aider à créer des contenus pédagogiques adaptés à vos besoins.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    console.log('Processing message:', message)

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embedding = await generateEmbedding(message)
    console.log('Generated embedding of length:', embedding.length)

    const response = getResponse(embedding)
    console.log('Generated response:', response)

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat-with-embeddings function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})