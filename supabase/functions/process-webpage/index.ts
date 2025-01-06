import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { load } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Fetching webpage content from:', url)

    const response = await fetch(url)
    const html = await response.text()
    
    // Use cheerio to parse HTML and extract text content
    const $ = load(html)
    
    // Remove script tags, style tags, and comments
    $('script').remove()
    $('style').remove()
    $('comments').remove()
    
    // Get text content from body
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000) // Limit text length for OpenAI

    console.log('Successfully extracted text from webpage')

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webpage:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process webpage' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})