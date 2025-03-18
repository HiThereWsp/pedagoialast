
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { 
  getStripeClient, 
  getSupabaseClient, 
  verifyStripeSignature, 
  handleError 
} from './utils.ts';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleCheckoutCompleted
} from './subscriptionHandlers.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Stripe webhook endpoint called");
    
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("No Stripe signature found in request headers");
      return new Response(JSON.stringify({ error: 'No Stripe signature found' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const body = await req.text();
    
    if (!body) {
      console.error("Empty request body received");
      return new Response(JSON.stringify({ error: 'Empty request body' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Webhook request received with signature: ${signature.substring(0, 10)}...`);
    
    // Vérifier la signature pour s'assurer que c'est bien Stripe qui envoie
    let event;
    
    try {
      event = verifyStripeSignature(body, signature);
      console.log(`Event successfully verified: ${event.id}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Événement Stripe reçu: ${event.type}`);
    
    // Initialiser les clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    // Traiter différents types d'événements
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, stripe);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, stripe);
        break;
      default:
        console.log(`Type d'événement non géré: ${event.type}`);
    }
    
    // Always return a 200 response to Stripe to acknowledge receipt
    return new Response(JSON.stringify({ received: true, event: event.type }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`Erreur générale non gérée: ${err.message}`);
    // Even for errors, we should return a 200 status to prevent Stripe from retrying
    // but log the error for debugging
    return new Response(JSON.stringify({ received: true, error: err.message }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
