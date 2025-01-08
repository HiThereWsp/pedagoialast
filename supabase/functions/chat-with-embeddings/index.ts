import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // First, get embeddings for the user message
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message,
        model: "text-embedding-3-small"
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embeddings')
    }

    const { data: embeddingData } = await embeddingResponse.json()
    const embedding = embeddingData[0].embedding

    // Fetch all system prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('tool_prompts')
      .select('*')

    if (promptsError) {
      throw new Error('Failed to fetch system prompts')
    }

    // For now, we'll use a simple approach: use the general prompt
    // In a future iteration, we could use the embeddings to find the most relevant prompt
    const generalPrompt = prompts.find(p => p.tool_type === 'general')
    const systemPrompt = generalPrompt?.system_prompt || "Tu es un assistant pédagogique polyvalent."

    // Get completion from OpenAI
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    })

    if (!completionResponse.ok) {
      const error = await completionResponse.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const completionData = await completionResponse.json()
    const response = completionData.choices[0].message.content

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