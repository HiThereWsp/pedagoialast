import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  threadId: string;
  messageId: string;
  messages: ChatMessage[];
  webSearchEnabled: boolean;
  deepResearchEnabled: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { threadId, messageId, messages, webSearchEnabled, deepResearchEnabled } = await req.json() as RequestBody

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate dummy response based on the last message
    const lastMessage = messages[messages.length - 1]
    const response = `This is a simulated response to: "${lastMessage.content}". Web search: ${webSearchEnabled}, Deep research: ${deepResearchEnabled}`

    // Save assistant's response to the database
    const { error: insertError } = await supabaseClient
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: response,
        metadata: {
          in_response_to: messageId,
          web_search_used: webSearchEnabled,
          deep_research_used: deepResearchEnabled
        }
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({
        content: response,
        metadata: {
          web_search_used: webSearchEnabled,
          deep_research_used: deepResearchEnabled
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
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
