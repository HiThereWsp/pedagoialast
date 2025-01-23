import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  prompt: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Error getting user')
    }

    // Get the request body
    const { prompt } = await req.json() as RequestBody

    // Check weekly usage
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const { data: usageData, error: usageError } = await supabaseClient
      .from('image_generation_usage')
      .select('id')
      .eq('user_id', user.id)
      .gte('generated_at', weekStart.toISOString())

    if (usageError) {
      throw new Error('Error checking usage')
    }

    if (usageData.length >= 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Weekly limit reached. You can generate up to 3 images per week.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }

    // Generate image with DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error generating image')
    }

    // Record usage
    const { error: insertError } = await supabaseClient
      .from('image_generation_usage')
      .insert({
        user_id: user.id,
        prompt,
        image_url: data.data[0].url
      })

    if (insertError) {
      throw new Error('Error recording usage')
    }

    return new Response(
      JSON.stringify({ image: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})