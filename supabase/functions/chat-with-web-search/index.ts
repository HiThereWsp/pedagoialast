import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const serpApiKey = Deno.env.get('SERP_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function searchWeb(query: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`)
    const data = await response.json()
    
    // Extract relevant information from search results
    const searchResults = data.organic_results?.slice(0, 3).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link
    })) || []

    return searchResults
  } catch (error) {
    console.error('Error searching web:', error)
    return []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json()

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!serpApiKey) {
      throw new Error('SERP API key not configured')
    }

    console.log('Searching web for:', message)
    const searchResults = await searchWeb(message)
    
    const systemPrompt = `Tu es un assistant pédagogique français qui aide les utilisateurs à apprendre et à comprendre des concepts. 
    Utilise les résultats de recherche web suivants pour enrichir ta réponse :
    ${JSON.stringify(searchResults)}
    ${context ? "\nVoici le contexte de la conversation précédente :\n\n" + context : ""}`

    console.log('Calling OpenAI API with enriched context')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
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
    const aiResponse = data.choices[0].message.content

    console.log('Successfully got response from OpenAI')

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your request'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})