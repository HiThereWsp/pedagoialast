
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
    apiVersion: '2023-10-16',
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
  
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET missing in environment variables');
    throw new Error('Webhook secret missing - please configure STRIPE_WEBHOOK_SECRET');
  }
  
  const stripe = getStripeClient();
  
  try {
    console.log(`Verifying signature with webhook secret: ${STRIPE_WEBHOOK_SECRET.substring(0, 3)}...`);
    return stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Signature verification error: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

export const handleError = (error: Error): Response => {
  console.error(`General webhook error: ${error.message}`);
  // Return a 200 response even for errors to prevent Stripe from retrying
  return new Response(JSON.stringify({ received: true, error: error.message }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};
