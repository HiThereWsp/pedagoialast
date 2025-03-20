
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

export const getStripeClient = (): Stripe => {
  // Nouvelle clé de test fixe
  const STRIPE_SECRET_KEY_TEST = "sk_test_51R4Z4eIHqPsl7TpblORlj8Cy63BSL8nTz16WtzTyWFpIXuDVQk4O92PgPRAK1pk0P8ZdjoCzt27X1r87BplLPdEQ00fU3ejj8o";
  const STRIPE_SECRET_KEY_LIVE = Deno.env.get('STRIPE_SECRET_KEY_LIVE');
  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  
  // Déterminer quelle clé utiliser
  let selectedKey: string | undefined;
  
  // Si nous avons des clés spécifiques pour test et production
  if (STRIPE_SECRET_KEY_TEST && STRIPE_SECRET_KEY_LIVE) {
    // Vérifier si le mode test est activé via une variable d'environnement
    const isTestMode = Deno.env.get('STRIPE_TEST_MODE') === 'true';
    selectedKey = isTestMode ? STRIPE_SECRET_KEY_TEST : STRIPE_SECRET_KEY_LIVE;
    console.log(`Using specific ${isTestMode ? 'TEST' : 'LIVE'} key based on STRIPE_TEST_MODE env`);
  } else {
    // Sinon, utiliser la clé générique ou la clé de test fixe
    selectedKey = STRIPE_SECRET_KEY || STRIPE_SECRET_KEY_TEST;
    console.log('Using generic STRIPE_SECRET_KEY or fixed TEST key');
  }
  
  if (!selectedKey) {
    console.error('No valid Stripe secret key found in environment variables or hardcoded value');
    throw new Error('STRIPE_SECRET_KEY missing');
  }
  
  const isTestKey = selectedKey.startsWith('sk_test_') || selectedKey.startsWith('rk_test_');
  console.log(`Using Stripe in ${isTestKey ? 'TEST' : 'LIVE'} mode with key prefix: ${selectedKey.substring(0, 8)}...`);
  
  return new Stripe(selectedKey, {
    apiVersion: '2020-08-27',
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
  
  // La nouvelle clé de test pour le webhook: on aura besoin de la configurer si ce n'est pas déjà fait
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const STRIPE_WEBHOOK_SECRET_TEST = Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST');
  
  if (!STRIPE_WEBHOOK_SECRET && !STRIPE_WEBHOOK_SECRET_TEST) {
    console.error('No webhook secrets found in environment variables');
    throw new Error('Webhook secret missing - please configure STRIPE_WEBHOOK_SECRET or STRIPE_WEBHOOK_SECRET_TEST');
  }
  
  const stripe = getStripeClient();
  let event: Stripe.Event | null = null;
  let error: Error | null = null;
  
  // Check if we're in test mode based on the Stripe key
  const isTestMode = stripe.getApiField('key').toString().startsWith('sk_test_') || 
                     stripe.getApiField('key').toString().startsWith('rk_test_') ||
                     Deno.env.get('STRIPE_TEST_MODE') === 'true';
  
  console.log(`Webhook verification: ${isTestMode ? 'TEST' : 'LIVE'} mode detected`);
  console.log(`Available webhook secret types: ${STRIPE_WEBHOOK_SECRET_TEST ? 'TEST ' : ''}${STRIPE_WEBHOOK_SECRET ? 'PRODUCTION' : ''}`);
  
  // First try with the test webhook secret if in test mode
  if (isTestMode && STRIPE_WEBHOOK_SECRET_TEST) {
    try {
      console.log(`Attempting verification with TEST webhook secret: ${STRIPE_WEBHOOK_SECRET_TEST.substring(0, 8)}...`);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET_TEST
      );
      console.log('Event verified with TEST webhook secret');
      return event;
    } catch (err) {
      error = err as Error;
      console.log(`TEST webhook verification failed: ${err.message}`);
    }
  }
  
  // If test verification fails or we're in production mode, try with production webhook secret
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      console.log(`Attempting verification with production webhook secret: ${STRIPE_WEBHOOK_SECRET.substring(0, 8)}...`);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      console.log('Event verified with production webhook secret');
      return event;
    } catch (err) {
      console.log(`Production webhook verification failed: ${(err as Error).message}`);
      // If we already had an error from test verification, throw that one
      if (error) {
        throw error;
      }
      throw err;
    }
  }
  
  // If we get here and we had an error from test verification, throw it
  if (error) {
    console.error(`Signature verification error: ${error.message}`);
    throw error;
  }
  
  // Allow skipping verification in development for debugging
  if (Deno.env.get('ENVIRONMENT') === 'development' || Deno.env.get('STRIPE_TEST_MODE') === 'true') {
    console.warn('DEV MODE: Bypassing signature verification');
    try {
      return JSON.parse(body) as Stripe.Event;
    } catch (err) {
      throw new Error(`Failed to parse event JSON: ${(err as Error).message}`);
    }
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
