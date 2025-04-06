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

    const lastMessage = messages[messages.length - 1]

    // Save the initial message with a placeholder content
    const { data: initialMessage, error: insertError } = await supabaseClient
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: 'Streaming in progress...', // Placeholder content to satisfy the constraint
        tokens_used: 0,
        metadata: {
          in_response_to: messageId,
          web_search_used: webSearchEnabled,
          deep_research_used: deepResearchEnabled,
          streaming: true
        }
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error saving initial message: ${insertError.message}`);
    }

    const messageIdInDb = initialMessage.id;
    let fullResponse = '';
    let sentenceIndex = 0;

    const dummySentences = [
      `I'm analyzing your request about "${lastMessage.content}".`,
      "This is a streaming response that comes in chunks.",
      "Each chunk will be sent separately to simulate a real AI response.",
      "Web search is " + (webSearchEnabled ? "enabled" : "disabled") + " for this request.",
      "Deep research is " + (deepResearchEnabled ? "enabled" : "disabled") + " for this request.",
      "This streaming approach allows the UI to show typing-like animations.",
      "You can see the response building up gradually instead of waiting for everything at once.",
      "This makes the experience feel more interactive and responsive.",
      "It's especially helpful for longer responses where users might otherwise think the system is frozen.",
      "You could add even more sentences here to make the response longer.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
      "The streaming response is now complete. Thank you for your patience!"
    ];

    const stream = new ReadableStream({
      start(controller) {
        const timer = setInterval(() => {
          if (sentenceIndex >= dummySentences.length) {
            clearInterval(timer);
            controller.close();

            // Update the message with the final content and remove streaming flag
            supabaseClient
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
              .then(({ error }) => {
                if (error) console.error('Error updating final message:', error);
              });

            return;
          }

          const nextChunk = dummySentences[sentenceIndex] + " ";
          fullResponse += nextChunk;
          sentenceIndex++;

          controller.enqueue(new TextEncoder().encode(nextChunk));
        }, 500);
      },
      cancel() {
        supabaseClient
          .from('chat_messages')
          .delete()
          .eq('id', messageIdInDb)
          .then(({ error }) => {
            if (error) console.error('Error cleaning up message:', error);
          });
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      },
    });

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