
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Signature manquante');
      return new Response('Signature manquante', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY manquante');
      return new Response('Configuration incorrecte', { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const body = await req.text();
    
    // Vérifier la signature pour s'assurer que c'est bien Stripe qui envoie
    let event;
    
    try {
      if (STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          STRIPE_WEBHOOK_SECRET
        );
      } else {
        // En développement, on peut accepter sans vérifier la signature
        event = JSON.parse(body);
        console.warn('Mode développement: signature Stripe non vérifiée!');
      }
    } catch (err) {
      console.error(`Erreur de signature: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Événement Stripe reçu: ${event.type}`);
    
    // Initialiser le client Supabase
    const supabase = createClient(
      SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Traiter différents types d'événements
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, stripe, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, stripe, supabase);
        break;
      default:
        console.log(`Type d'événement non géré: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`Erreur générale du webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Fonction pour gérer la création d'abonnement
async function handleSubscriptionCreated(subscription, stripe, supabase) {
  console.log('Traitement de customer.subscription.created');
  
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
  
  try {
    // Obtenir les détails du client depuis Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = typeof customer === 'object' ? customer.email : null;
    
    if (!customerEmail) {
      throw new Error('Email client non trouvé');
    }
    
    // Trouver l'utilisateur par email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', customerEmail)
      .single();
      
    if (userError || !userData) {
      console.error('Utilisateur non trouvé:', userError);
      throw new Error(`Utilisateur non trouvé pour l'email: ${customerEmail}`);
    }
    
    const userId = userData.id;
    
    // Mettre à jour ou créer l'enregistrement dans user_subscriptions
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        type: 'paid',
        expires_at: expiresAt
      }, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', upsertError);
      throw upsertError;
    }
    
    console.log(`Abonnement créé pour l'utilisateur ${userId}`);
    
    // Appeler la fonction de synchronisation avec Brevo si elle existe
    try {
      await supabase.functions.invoke('create-brevo-contact', {
        body: { 
          email: customerEmail,
          contactName: 'Membre Premium',
          source: "paid_subscription"
        }
      });
      console.log('Utilisateur synchronisé avec Brevo');
    } catch (brevoError) {
      console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
      // On continue même si la synchro Brevo échoue
    }
    
  } catch (error) {
    console.error('Erreur dans handleSubscriptionCreated:', error);
    throw error;
  }
}

// Fonction pour gérer les mises à jour d'abonnement
async function handleSubscriptionUpdated(subscription, supabase) {
  console.log('Traitement de customer.subscription.updated');
  
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
  
  try {
    // Rechercher l'abonnement existant
    const { data: existingSubscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    
    if (findError || !existingSubscription) {
      console.error('Abonnement non trouvé:', findError);
      return; // On ne peut pas mettre à jour un abonnement qui n'existe pas
    }
    
    // Mettre à jour le statut et la date d'expiration
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: status === 'active' ? 'active' : 'inactive',
        expires_at: expiresAt
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', updateError);
      throw updateError;
    }
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${existingSubscription.user_id}`);
  } catch (error) {
    console.error('Erreur dans handleSubscriptionUpdated:', error);
    throw error;
  }
}

// Fonction pour gérer la suppression d'abonnement
async function handleSubscriptionDeleted(subscription, supabase) {
  console.log('Traitement de customer.subscription.deleted');
  
  const subscriptionId = subscription.id;
  
  try {
    // Rechercher l'abonnement existant
    const { data: existingSubscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    
    if (findError || !existingSubscription) {
      console.error('Abonnement non trouvé:', findError);
      return; // On ne peut pas mettre à jour un abonnement qui n'existe pas
    }
    
    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'inactive',
        type: 'canceled'
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', updateError);
      throw updateError;
    }
    
    console.log(`Abonnement supprimé pour l'utilisateur ${existingSubscription.user_id}`);
  } catch (error) {
    console.error('Erreur dans handleSubscriptionDeleted:', error);
    throw error;
  }
}

// Fonction pour gérer la complétion d'un paiement via checkout
async function handleCheckoutCompleted(session, stripe, supabase) {
  console.log('Traitement de checkout.session.completed');
  
  try {
    // Vérifier si c'est un checkout pour un abonnement
    if (session.mode !== 'subscription') {
      console.log('Ce n\'est pas un checkout d\'abonnement, on ignore');
      return;
    }
    
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      throw new Error('Email client non trouvé dans la session de checkout');
    }
    
    // Vérifier si l'abonnement est bien créé
    if (session.subscription) {
      // On peut récupérer les détails de l'abonnement
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      // Et appeler notre fonction de création d'abonnement
      await handleSubscriptionCreated(subscription, stripe, supabase);
    } else {
      console.error('ID d\'abonnement manquant dans la session de checkout');
    }
    
    console.log('Checkout traité avec succès');
  } catch (error) {
    console.error('Erreur dans handleCheckoutCompleted:', error);
    throw error;
  }
}
