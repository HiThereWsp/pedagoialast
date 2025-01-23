import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { prompt } = await req.json()
    
    if (!prompt) {
      throw new Error('No prompt provided')
    }

    console.log('Generating image with prompt:', prompt)

    // Call OpenAI API to generate image with all DALL-E 3 parameters
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid", // Using vivid style for more dramatic images
        response_format: "url",
      }),
    })

    const data = await response.json()
    console.log('OpenAI API response:', data)

    if (!response.ok) {
      console.error('OpenAI API error:', data)
      throw new Error(data.error?.message || 'Failed to generate image')
    }

    if (!data.data?.[0]?.url) {
      console.error('No image URL in response:', data)
      throw new Error('No image URL received from OpenAI')
    }

    // Try to record usage but don't fail if it doesn't work
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: insertError } = await supabaseClient
        .from('image_generation_usage')
        .insert({
          prompt,
          image_url: data.data[0].url,
        })

      if (insertError) {
        console.error('Error recording usage:', insertError)
        return new Response(
          JSON.stringify({ 
            image: data.data[0].url,
            warning: 'Image generated successfully but failed to record usage'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (error) {
      console.error('Error recording usage:', error)
      return new Response(
        JSON.stringify({ 
          image: data.data[0].url,
          warning: 'Image generated successfully but failed to record usage'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ image: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})