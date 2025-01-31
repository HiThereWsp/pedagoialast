import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const DALLE_API_KEY = Deno.env.get('DALLE_API_KEY')
    if (!DALLE_API_KEY) {
      console.error('DALLE_API_KEY is not set')
      throw new Error('La clé API DALL-E n\'est pas configurée')
    }

    const body = await req.json()
    const { prompt, size = "1024x1024", style = "vivid", quality = "standard", originalImageUrl } = body

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Le prompt est requis" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating/Editing image with DALL-E 3")
    console.log("Original image URL:", originalImageUrl)
    console.log("Prompt:", prompt)
    
    let response;
    
    if (originalImageUrl) {
      // If we have an original image, use the edit endpoint
      try {
        // First, fetch the original image
        const imageResponse = await fetch(originalImageUrl)
        if (!imageResponse.ok) throw new Error('Failed to fetch original image')
        const imageBlob = await imageResponse.blob()
        
        // Create form data for the edit request
        const formData = new FormData()
        formData.append('image', imageBlob, 'image.png')
        formData.append('prompt', prompt)
        formData.append('n', '1')
        formData.append('size', size)
        
        response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DALLE_API_KEY}`,
          },
          body: formData
        })
      } catch (error) {
        console.error("Error editing image:", error)
        throw new Error('Erreur lors de la modification de l\'image')
      }
    } else {
      // If no original image, use the standard generation endpoint
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DALLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size,
          quality,
          style,
          response_format: "url"
        })
      })
    }

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      throw new Error(error.error?.message || 'Erreur lors de la génération/modification de l\'image')
    }

    const data = await response.json()
    console.log("Generation/Edition successful, returning URL")
    
    return new Response(JSON.stringify({ 
      output: data.data[0].url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in generate-image function:", error)
    let errorMessage = "Une erreur est survenue lors de la génération/modification de l'image"
    
    if (error.message.includes('API')) {
      errorMessage = error.message
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})