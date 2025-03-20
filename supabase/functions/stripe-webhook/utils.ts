
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

export const getStripeClient = (): Stripe => {
  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY missing in environment variables');
    throw new Error('STRIPE_SECRET_KEY missing');
  }
  
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27', // Updated to match Stripe's webhook API version
  });
};

export const getSupabaseClient = () => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase configuration missing: URL or service role key not found');
    throw new Error('SUPABASE configuration missing');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

export const verifyStripeSignature = (
  body: string, 
  signature: string | null
): Stripe.Event => {
  if (!signature) {
    console.error('Stripe signature missing in request headers');
    throw new Error('Signature missing');
  }
  
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const STRIPE_WEBHOOK_SECRET_TEST = Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST');
  
  if (!STRIPE_WEBHOOK_SECRET && !STRIPE_WEBHOOK_SECRET_TEST) {
    console.error('No webhook secrets found in environment variables');
    throw new Error('Webhook secret missing - please configure STRIPE_WEBHOOK_SECRET or STRIPE_WEBHOOK_SECRET_TEST');
  }
  
  const stripe = getStripeClient();
  let event: Stripe.Event | null = null;
  let error: Error | null = null;
  
  // First try with the production webhook secret
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      console.log(`Attempting verification with production webhook secret: ${STRIPE_WEBHOOK_SECRET.substring(0, 3)}...`);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      console.log('Event verified with production secret');
      return event;
    } catch (err) {
      error = err;
      console.log(`Production webhook verification failed: ${err.message}`);
    }
  }
  
  // If production verification fails or no production secret is set, try with test webhook secret
  if (STRIPE_WEBHOOK_SECRET_TEST) {
    try {
      console.log(`Attempting verification with test webhook secret: ${STRIPE_WEBHOOK_SECRET_TEST.substring(0, 3)}...`);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET_TEST
      );
      console.log('Event verified with test secret');
      return event;
    } catch (err) {
      console.log(`Test webhook verification failed: ${err.message}`);
      // If we already had an error from production verification, throw that one
      if (error) {
        throw error;
      }
      throw err;
    }
  }
  
  // If we get here and we had an error from production verification, throw it
  if (error) {
    console.error(`Signature verification error: ${error.message}`);
    throw error;
  }
  
  // This should be unreachable, but just in case
  throw new Error('Webhook verification failed - no valid webhook secret found');
};

export const handleError = (error: Error): Response => {
  console.error(`General webhook error: ${error.message}`);
  // Return a 200 response even for errors to prevent Stripe from retrying
  return new Response(JSON.stringify({ received: true, error: error.message }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};
