
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request data
    const { record } = await req.json()
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the BREVO_API_KEY from environment variables
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is missing")
      return new Response(
        JSON.stringify({ error: "BREVO_API_KEY is missing" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      )
    }

    // Prepare user data for Brevo
    const email = record.email
    const firstName = record.raw_user_meta_data?.first_name || 'Utilisateur'

    console.log(`Adding new user to Brevo: ${firstName} (${email})`)

    // Create Brevo contact
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          PRENOM: firstName,
          EMAIL: email,
          SOURCE: "Inscription site web"
        },
        updateEnabled: true, // Update existing contacts
        listIds: [7], // Add to list #7 only
      }),
    })

    // Get response details for logging
    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = responseText
    }

    // Log response
    if (!response.ok) {
      console.error(`Error adding user to Brevo: ${JSON.stringify(responseData)}`)
      return new Response(
        JSON.stringify({ 
          error: "Failed to add user to Brevo",
          details: responseData
        }),
        { 
          status: response.status,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      )
    }

    console.log(`Successfully added user to Brevo: ${JSON.stringify(responseData)}`)
    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    )
  } catch (error) {
    console.error(`Error in handle-user-signup function: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    )
  }
})
