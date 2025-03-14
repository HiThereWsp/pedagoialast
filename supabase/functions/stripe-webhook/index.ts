
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
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    // Vérifier la signature pour s'assurer que c'est bien Stripe qui envoie
    let event;
    
    try {
      event = verifyStripeSignature(body, signature);
    } catch (err) {
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
    
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return handleError(err);
  }
});
