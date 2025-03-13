
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY est manquant');
    }
    
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET est manquant');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    // Créer un client Supabase pour accéder à la base de données
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Valider la signature du webhook Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Signature Stripe manquante');
    }
    
    // Récupérer le corps de la requête
    const body = await req.text();
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`⚠️ Erreur de signature webhook : ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    console.log(`🔔 Événement reçu: ${event.type}`);
    
    // Traiter les différents types d'événements
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Récupérer l'utilisateur associé à ce client Stripe
        const { data: userData, error: userError } = await supabaseClient
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (userError) {
          console.error(`❌ Erreur lors de la recherche de l'utilisateur: ${userError.message}`);
          // Si l'utilisateur n'est pas trouvé par stripe_customer_id, on ne peut pas continuer
          if (userError.code === 'PGRST116') {
            console.log(`⚠️ Aucun utilisateur trouvé avec stripe_customer_id: ${customerId}`);
            // Mais on renvoie 200 pour que Stripe ne réessaie pas
            return new Response(JSON.stringify({ received: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          throw userError;
        }
        
        // Déterminer le statut de l'abonnement
        const isActive = 
          subscription.status === 'active' || 
          subscription.status === 'trialing';
        
        // Mettre à jour l'abonnement de l'utilisateur
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            type: 'paid',
            status: isActive ? 'active' : 'expired',
            stripe_subscription_id: subscription.id,
            // Mettre à jour la date d'expiration en fonction de la période de facturation
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.user_id);
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de l'abonnement: ${updateError.message}`);
          throw updateError;
        }
        
        console.log(`✅ Abonnement mis à jour pour l'utilisateur: ${userData.user_id}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Trouver l'abonnement par ID
        const { data: subData, error: subError } = await supabaseClient
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subError) {
          console.error(`❌ Erreur lors de la recherche de l'abonnement: ${subError.message}`);
          throw subError;
        }
        
        // Marquer l'abonnement comme expiré
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', subData.user_id);
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de l'abonnement: ${updateError.message}`);
          throw updateError;
        }
        
        console.log(`✅ Abonnement marqué comme expiré pour l'utilisateur: ${subData.user_id}`);
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Récupérer le client et la référence à l'utilisateur
        const customerId = session.customer;
        const userId = session.client_reference_id; // Doit être défini lors de la création de la session
        
        if (!userId) {
          console.error('❌ Pas de client_reference_id dans la session checkout');
          return new Response(JSON.stringify({ error: 'Pas de référence utilisateur' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Récupérer l'abonnement associé à cette session
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          console.error('❌ Pas d\'ID d\'abonnement dans la session checkout');
          return new Response(JSON.stringify({ error: 'Pas d\'ID d\'abonnement' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Récupérer les détails de l'abonnement depuis Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        
        // Mettre à jour l'abonnement dans la base de données
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            type: 'paid',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de l'abonnement: ${updateError.message}`);
          throw updateError;
        }
        
        console.log(`✅ Abonnement créé pour l'utilisateur: ${userId}`);
        break;
      }
      
      default:
        console.log(`⚠️ Événement non géré: ${event.type}`);
    }
    
    // Réponse pour confirmer la réception du webhook
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`❌ Erreur dans le webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
