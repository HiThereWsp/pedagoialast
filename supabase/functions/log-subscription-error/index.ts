
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }
  
  try {
    const { errorType, details, userId } = await req.json()
    const timestamp = new Date().toISOString()
    
    console.error(`[${timestamp}] Erreur d'abonnement: Type=${errorType}, User=${userId}`)
    console.error('Détails:', JSON.stringify(details, null, 2))
    
    // Here we could record in a Supabase table, send errors to an external service like Sentry, etc.
    
    // TODO: Implement error persistence if needed
    
    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur dans log-subscription-error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
