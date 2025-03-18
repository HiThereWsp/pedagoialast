
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

export const getStripeClient = (): Stripe => {
  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
    throw new Error('STRIPE_SECRET_KEY manquante');
  }
  
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
};

export const getSupabaseClient = () => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Configuration Supabase manquante: URL ou clé de service non trouvée');
    throw new Error('SUPABASE configuration manquante');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

export const verifyStripeSignature = (
  body: string, 
  signature: string | null
): Stripe.Event => {
  if (!signature) {
    console.error('Signature Stripe manquante dans les en-têtes de la requête');
    throw new Error('Signature manquante');
  }
  
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET manquante, la signature ne sera pas vérifiée en production!');
  }
  
  const stripe = getStripeClient();
  
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      console.log(`Vérification de la signature avec la clé secrète: ${STRIPE_WEBHOOK_SECRET.substring(0, 3)}...`);
      return stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } else {
      // En développement, on peut accepter sans vérifier la signature
      console.warn('Mode développement: signature Stripe non vérifiée!');
      return JSON.parse(body);
    }
  } catch (err) {
    console.error(`Erreur de vérification de signature: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

export const handleError = (error: Error): Response => {
  console.error(`Erreur générale du webhook: ${error.message}`);
  // Return a 200 response even for errors to prevent Stripe from retrying
  return new Response(JSON.stringify({ received: true, error: error.message }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};
