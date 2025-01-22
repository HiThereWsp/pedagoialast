import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const sonarApiKey = Deno.env.get('SONAR_API_KEY')

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
    const { query } = await req.json()

    if (!sonarApiKey) {
      throw new Error('SONAR_API_KEY is not configured')
    }

    console.log('Calling Sonar API with query:', query)

    const response = await fetch('https://api.sonar.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sonarApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5, // Nombre de résultats à retourner
        filters: {
          language: 'fr', // Langue des résultats
          type: 'web' // Type de recherche
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Sonar API error:', error)
      throw new Error('Error calling Sonar API')
    }

    const data = await response.json()
    console.log('Successfully got response from Sonar')

    return new Response(JSON.stringify({ results: data.results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in web-search function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your search request'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})