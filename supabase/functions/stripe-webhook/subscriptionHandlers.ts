
import { getSupabaseClient } from './utils.ts';
import Stripe from "https://esm.sh/stripe@14.21.0";

// Fonction pour gérer la création d'abonnement
export async function handleSubscriptionCreated(subscription: Stripe.Subscription, stripe: Stripe) {
  console.log('Traitement de customer.subscription.created');
  
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
  const supabase = getSupabaseClient();
  
  try {
    // Obtenir les détails du client depuis Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = typeof customer === 'object' ? customer.email : null;
    const productId = typeof customer === 'object' && customer.metadata ? customer.metadata.productId : null;
    const promoCode = typeof customer === 'object' && customer.metadata ? customer.metadata.promoCode : null;
    
    console.log('Customer metadata:', customer.metadata);
    console.log('Product ID from metadata:', productId);
    console.log('Promo code from metadata:', promoCode);
    
    if (!customerEmail) {
      throw new Error('Email client non trouvé');
    }
    
    // Trouver l'utilisateur par email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', customer.metadata.userId)
      .single();
      
    if (userError || !userData) {
      console.error('Utilisateur non trouvé:', userError);
      throw new Error(`Utilisateur non trouvé pour l'ID: ${customer.metadata.userId}`);
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
        product_id: productId,
        promo_code: promoCode || null,
        expires_at: expiresAt
      }, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', upsertError);
      throw upsertError;
    }
    
    console.log(`Abonnement créé pour l'utilisateur ${userId} avec le product ID: ${productId}`);
    
    // Synchroniser avec Brevo - déplacer l'utilisateur vers la liste des utilisateurs premium
    try {
      await supabase.functions.invoke('create-brevo-contact', {
        body: { 
          email: customerEmail,
          contactName: customer.name || 'Membre Premium',
          userType: "premium", // Marquer comme utilisateur premium
          source: "paid_subscription"
        }
      });
      console.log('Utilisateur déplacé vers la liste premium dans Brevo');
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
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Traitement de customer.subscription.updated');
  
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
  const supabase = getSupabaseClient();
  
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
    
    // Si le statut a changé, mettre à jour dans Brevo également
    if (status !== 'active') {
      // Obtenir l'email de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', existingSubscription.user_id)
        .single();
      
      if (!userError && userData && userData.email) {
        try {
          // L'abonnement n'est plus actif, remettre l'utilisateur dans la liste des utilisateurs gratuits
          await supabase.functions.invoke('create-brevo-contact', {
            body: { 
              email: userData.email,
              userType: "free", // Remettre comme utilisateur gratuit
              source: "subscription_updated"
            }
          });
          console.log('Utilisateur remis dans la liste des utilisateurs gratuits dans Brevo');
        } catch (brevoError) {
          console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
        }
      }
    }
  } catch (error) {
    console.error('Erreur dans handleSubscriptionUpdated:', error);
    throw error;
  }
}

// Fonction pour gérer la suppression d'abonnement
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Traitement de customer.subscription.deleted');
  
  const subscriptionId = subscription.id;
  const supabase = getSupabaseClient();
  
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
    
    // Obtenir l'email de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', existingSubscription.user_id)
      .single();
    
    if (!userError && userData && userData.email) {
      try {
        // L'abonnement est supprimé, remettre l'utilisateur dans la liste des utilisateurs gratuits
        await supabase.functions.invoke('create-brevo-contact', {
          body: { 
            email: userData.email,
            userType: "free", // Remettre comme utilisateur gratuit
            source: "subscription_canceled"
          }
        });
        console.log('Utilisateur remis dans la liste des utilisateurs gratuits dans Brevo');
      } catch (brevoError) {
        console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
      }
    }
  } catch (error) {
    console.error('Erreur dans handleSubscriptionDeleted:', error);
    throw error;
  }
}

// Fonction pour gérer la complétion d'un paiement via checkout
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  console.log('Traitement de checkout.session.completed');
  const supabase = getSupabaseClient();
  
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
    
    // Récupérer les métadonnées de la session
    console.log('Métadonnées de la session:', session.metadata);
    const userId = session.metadata?.userId;
    const subscriptionType = session.metadata?.subscriptionType || 'monthly';
    const promoCode = session.metadata?.promoCode || session.metadata?.applied_promo_code;
    
    // Enregistrer l'événement de paiement réussi
    try {
      await supabase.from('payment_events').insert({
        user_id: userId,
        email: customerEmail,
        plan_type: subscriptionType,
        event_type: 'payment_completed',
        payment_method: 'stripe_checkout',
        promo_code: promoCode || null
      });
      console.log('Événement de paiement enregistré avec succès');
    } catch (eventError) {
      console.error('Erreur lors de l\'enregistrement de l\'événement:', eventError);
      // On continue malgré l'erreur
    }
    
    // Vérifier si l'abonnement est bien créé
    if (session.subscription) {
      // On peut récupérer les détails de l'abonnement
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Et appeler notre fonction de création d'abonnement
      await handleSubscriptionCreated(subscription, stripe);
    } else {
      console.error('ID d\'abonnement manquant dans la session de checkout');
    }
    
    console.log('Checkout traité avec succès');
  } catch (error) {
    console.error('Erreur dans handleCheckoutCompleted:', error);
    throw error;
  }
}
