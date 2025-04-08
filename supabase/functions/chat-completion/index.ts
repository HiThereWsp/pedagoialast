import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { streamMistralResponse } from './mistralai.ts'

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqData = await req.json() as RequestBody
    const { threadId, messageId, messages, webSearchEnabled, deepResearchEnabled } = reqData

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save the initial message with a placeholder content
    const { data: initialMessage, error: insertError } = await supabaseClient
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: 'Streaming in progress...',
        tokens_used: 0,
        metadata: {
          in_response_to: messageId,
          web_search_used: webSearchEnabled,
          deep_research_used: deepResearchEnabled,
          streaming: true
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving initial message:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const messageIdInDb = initialMessage.id

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const fullResponse = await streamMistralResponse(
            { messages, webSearchEnabled, deepResearchEnabled },
            (chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
            },
            (error) => {
              console.error('Mistral streaming error:', error);
              controller.error(error);
            }
          );

          // Update the message with the final content and remove streaming flag
          await supabaseClient
            .from('chat_messages')
            .update({
              content: fullResponse,
              metadata: {
                in_response_to: messageId,
                web_search_used: webSearchEnabled,
                deep_research_used: deepResearchEnabled,
                streaming: false
              }
            })
            .eq('id', messageIdInDb)
            .single()
            .then(({ error }) => {
              if (error) console.error('Error updating final message:', error);
            });

          controller.close();
        } catch (e) {
          console.error('Streaming error in index.ts:', e);
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in index.ts:', error);
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