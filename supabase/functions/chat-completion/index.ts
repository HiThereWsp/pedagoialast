import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { streamMistralResponse } from './mistralai.ts'
import { searchWithExa } from './exaai.ts'
import { SYSTEM_PROMPT, formatPrompt } from './prompt.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  threadId: string;
  messageId: string;
  messages: ChatMessage[];
  webSearchEnabled: boolean;
  deepResearchEnabled: boolean;
  searchOnly?: boolean;
  existingSearchResults?: ExaSearchResult[];
}

interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score: number;
  text: string;
  favicon?: string;
  image?: string;
  extras?: {
    links?: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  try {
    // Parse the request body
    const { threadId, messageId, messages, webSearchEnabled = false, deepResearchEnabled = false, searchOnly = false, existingSearchResults = [] } = await req.json();
    
    console.log(`Processing request for thread ${threadId}, message ${messageId}`);
    console.log(`Web search enabled: ${webSearchEnabled}, Deep research enabled: ${deepResearchEnabled}, Search only: ${searchOnly}`);
    console.log(`Messages count: ${messages?.length || 0}`);
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let exaResults: ExaSearchResult[] | null = existingSearchResults?.length > 0 ? existingSearchResults : null;

    // Get the last user message
    const lastUserMessage = messages?.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      console.error('No user messages found in the conversation');
      return new Response(
        JSON.stringify({ error: 'No user messages found in the conversation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Last user message:', lastUserMessage.content);

    // Step 1: If web search is enabled and we don't have existing results, perform search with Exa
    if (webSearchEnabled && !exaResults) {
      try {
        console.log('Web search enabled, performing Exa search');
        
        // Perform search with Exa
        console.log('Searching with Exa for:', lastUserMessage.content);
        const searchResults = await searchWithExa({
          query: lastUserMessage.content + " related to France",
          numResults: 5
        });
        
        if (searchResults && searchResults.results) {
          exaResults = searchResults.results;
          console.log('Exa search returned', exaResults.length, 'results');
        } else {
          console.log('No search results returned from Exa');
        }
      } catch (error) {
        console.error('Error during Exa search:', error);
        // Continue without search results if there's an error
      }
    } else {
      console.log('Web search disabled or using existing results, skipping Exa search');
    }

    // If this is a search-only request, return the sources and exit
    if (searchOnly) {
      console.log('Search only request, returning sources');
      return new Response(
        JSON.stringify({
          sources: exaResults || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format messages for Mistral AI
    const formatMessagesForMistral = (messages: any[], exaResults: ExaSearchResult[] | null): any[] => {
      // Get the last 5 messages for conversation history
      const lastFiveMessages = messages.slice(-5).map(message => ({ 
        role: message.role, 
        content: message.content 
      }));
      
      // Start with a system message containing the prompt
      const formattedMessages = [{
        role: 'system',
        content: SYSTEM_PROMPT
      }];
      
      // Add the conversation history
      formattedMessages.push(...lastFiveMessages);
      
      // If we have Exa results, add them as context in a system message
      if (exaResults && exaResults.length > 0) {
        console.log('Adding Exa results to Mistral context');
        
        // Format the results for better readability and ensure type safety
        const formattedResults = exaResults
          .filter((result): result is ExaSearchResult => result !== null && result !== undefined)
          .map(result => ({
            id: result.id || `result-${Math.random().toString(36).substring(2, 9)}`,
            title: result.title || 'Untitled Source',
            url: result.url || '#',
            publishedDate: result.publishedDate || new Date().toISOString(),
            author: result.author || '',
            score: result.score || 0,
            text: result.text || '',
            favicon: result.favicon || ''
          }));
        
        // Only proceed if we have valid results after filtering
        if (formattedResults.length > 0) {
          const exaContext = `I found the following information that might help answer the query:\n\n${formattedResults
            .map((result, index) => `[${index + 1}] ${result.title}\n${result.text}\nSource: ${result.url}`)
            .join('\n\n')}`;
          
          // Add the Exa context as a system message before the last user message
          formattedMessages.push({
            role: 'system',
            content: exaContext
          });
          
          // Replace the exaResults with the formatted results
          exaResults = formattedResults;
        }
      }
      
      return formattedMessages;
    };

    // Step 2: Generate response with Mistral AI
    console.log('Generating response with Mistral AI');
    
    // Format messages for Mistral
    const formattedMessages = formatMessagesForMistral(messages, exaResults);
    
    // Get the last user message for prompt formatting
    const userMessageForPrompt = messages.find(msg => msg.role === 'user');
    const userMessageContent = userMessageForPrompt ? userMessageForPrompt.content : '';
    
    // Format search results for the prompt
    let exaResultsText = '';
    if (exaResults && exaResults.length > 0) {
      exaResultsText = exaResults.map((result, index) => 
        `Source ${index + 1}: ${result.title}\n${result.text}\nURL: ${result.url}`
      ).join('\n\n');
    }
    
    // Create a custom prompt using the formatPrompt function
    const customPrompt = formatPrompt(userMessageContent, exaResultsText);
    
    // Create a readable stream for the response
    const stream = new ReadableStream({
      start(controller) {
        console.log('Starting stream');
        
        // Stream the response from Mistral
        try {
          let fullResponse = '';
          streamMistralResponse(
            { 
              messages: formattedMessages, 
              webSearchEnabled, 
              deepResearchEnabled,
              prompt: customPrompt
            },
            (chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
              fullResponse += chunk;
            },
            () => {
              // Save the final response as a new message
              supabaseAdmin
                .from('chat_messages')
                .insert({
                  thread_id: threadId,
                  role: 'assistant',
                  content: fullResponse,
                  metadata: {
                    mistral_payload: {
                      messages: formattedMessages,
                      webSearchEnabled,
                      deepResearchEnabled,
                      prompt: customPrompt
                    }
                  }
                })
                .then(() => {
                  console.log('Saved assistant message to database');
                })
                .catch((error) => {
                  console.error('Error saving assistant message to database:', error);
                });
              
              controller.close();
            }
          );
        } catch (error) {
          console.error('Error in stream start:', error);
          controller.error(error);
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
    console.error('Error in handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return handler(req)
})