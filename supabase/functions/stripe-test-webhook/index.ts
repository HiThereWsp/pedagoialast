
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Simple redirector function that forwards all webhook requests to the main webhook
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Stripe test webhook received - redirecting to main webhook");
    
    // Get the original request body
    const body = await req.text();
    
    // Get all headers from the original request
    const headers = Object.fromEntries([...req.headers.entries()]);
    
    // Extract the stripe-signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error("No Stripe signature found in request headers");
      return new Response(JSON.stringify({ error: 'No Stripe signature found' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Redirecting webhook with signature: ${signature.substring(0, 10)}...`);
    
    // Create a new request to the main webhook
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const mainWebhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`;
    
    console.log(`Forwarding request to ${mainWebhookUrl}`);
    
    // Forward the request to the main webhook
    const response = await fetch(mainWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
        // Don't forward Authorization as it's not needed and might be causing issues
      },
      body: body
    });
    
    // Get the response from the main webhook
    const responseBody = await response.text();
    console.log(`Main webhook response status: ${response.status}`);
    
    // Return the response from the main webhook
    return new Response(responseBody, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error(`Error forwarding webhook: ${err.message}`);
    console.error(err.stack);
    
    // Even for errors, return a 200 to prevent Stripe from retrying
    return new Response(JSON.stringify({ received: true, error: err.message }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
