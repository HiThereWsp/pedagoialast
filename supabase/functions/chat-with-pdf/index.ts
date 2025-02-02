import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, documentId } = await req.json()

    if (!message || !documentId) {
      throw new Error('Message and document ID are required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get relevant document sections based on the query
    const { data: sections, error: searchError } = await supabaseClient
      .from('pdf_embeddings')
      .select('content')
      .eq('document_id', documentId)
      .limit(5)

    if (searchError) throw searchError

    // Combine relevant sections
    const context = sections.map(s => s.content).join('\n\n')

    // Get response from OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui aide à comprendre le contenu d'un document PDF. 
                     Utilise le contexte fourni pour répondre aux questions de manière précise et concise. 
                     Si tu ne trouves pas l'information dans le contexte, dis-le honnêtement.
                     Contexte du document:\n${context}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get AI response')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in chat-with-pdf function:', error)
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