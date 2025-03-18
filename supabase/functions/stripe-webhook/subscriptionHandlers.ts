
import { getSupabaseClient } from './utils.ts';
import Stripe from "https://esm.sh/stripe@14.21.0";

// Fonction pour gérer la création d'abonnement
export async function handleSubscriptionCreated(subscription: Stripe.Subscription, stripe: Stripe) {
  console.log('Traitement de customer.subscription.created', subscription.id);
  
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
      console.error('Email client non trouvé pour le client Stripe:', customerId);
      throw new Error('Email client non trouvé');
    }
    
    // Trouver l'utilisateur par ID utilisateur dans les métadonnées du client
    if (!customer.metadata?.userId) {
      console.error('ID utilisateur non trouvé dans les métadonnées du client Stripe:', customerId);
      throw new Error('ID utilisateur non trouvé dans les métadonnées');
    }
    
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

    // Vérifier si c'est un produit ambassadeur gratuit
    const isAmbassadorProduct = await isAmbassadorSubscription(subscription, stripe);
    
    // Vérifier si c'est un essai de 200 jours
    const isLongTrial = isLongTrialSubscription(subscription);
    
    // Déterminer le type d'abonnement
    let subscriptionType = 'paid';
    if (isAmbassadorProduct) {
      subscriptionType = 'ambassador';
    } else if (isLongTrial) {
      subscriptionType = 'trial';
    }
    
    console.log(`Type d'abonnement détecté: ${subscriptionType}`);
    
    // Extraire la date de fin d'essai si c'est un abonnement avec essai
    let trialEnd = null;
    if (subscription.trial_end) {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
      console.log(`Fin de période d'essai: ${trialEnd}`);
    }
    
    // Mettre à jour ou créer l'enregistrement dans user_subscriptions
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        type: subscriptionType,
        product_id: productId,
        promo_code: promoCode || null,
        expires_at: trialEnd || expiresAt,
        trial_end: trialEnd,
        is_long_trial: isLongTrial || false
      }, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', upsertError);
      throw upsertError;
    }
    
    console.log(`Abonnement ${subscriptionType} créé pour l'utilisateur ${userId} avec le product ID: ${productId}`);
    
    // Si c'est un ambassadeur, ajouter aussi à la table ambassador_program
    if (isAmbassadorProduct) {
      console.log('Ajout de l\'utilisateur au programme ambassadeur');
      
      const { error: ambassadorError } = await supabase
        .from('ambassador_program')
        .upsert({
          user_id: userId,
          email: customerEmail,
          full_name: customer.name || null,
          status: 'active',
          approved_at: new Date().toISOString(),
          expires_at: expiresAt
        }, {
          onConflict: 'user_id'
        });
        
      if (ambassadorError) {
        console.error('Erreur lors de l\'ajout au programme ambassadeur:', ambassadorError);
        // On continue malgré l'erreur pour ne pas bloquer l'activation de l'abonnement
      } else {
        console.log('Utilisateur ajouté avec succès au programme ambassadeur');
      }
    }
    
    // Synchroniser avec Brevo - déplacer l'utilisateur vers la liste des utilisateurs premium
    try {
      let userType = "premium";
      if (isAmbassadorProduct) {
        userType = "ambassador";
      } else if (isLongTrial) {
        userType = "long_trial";
      }
      
      await supabase.functions.invoke('create-brevo-contact', {
        body: { 
          email: customerEmail,
          contactName: customer.name || 'Membre Premium',
          userType: userType,
          source: isLongTrial ? "200day_trial" : (isAmbassadorProduct ? "ambassador_program" : "paid_subscription")
        }
      });
      console.log(`Utilisateur déplacé vers la liste ${userType} dans Brevo`);
    } catch (brevoError) {
      console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
      // On continue même si la synchro Brevo échoue
    }
    
  } catch (error) {
    console.error('Erreur dans handleSubscriptionCreated:', error.message);
    // Rethrow to allow top-level error handler to handle it
    throw error;
  }
}

// Fonction pour déterminer si un abonnement est un produit ambassadeur (gratuit)
async function isAmbassadorSubscription(subscription: Stripe.Subscription, stripe: Stripe): Promise<boolean> {
  try {
    // Vérifier si le prix est à 0
    const hasFreePrice = subscription.items.data.some(item => 
      item.price.unit_amount === 0 || item.price.unit_amount === null
    );
    
    if (!hasFreePrice) {
      return false;
    }
    
    // Si le prix est à 0, vérifier si c'est le produit ambassadeur spécifique
    // On peut vérifier par ID de produit ou par métadonnées
    for (const item of subscription.items.data) {
      const productId = item.price.product as string;
      const product = await stripe.products.retrieve(productId);
      
      // Vérifier les métadonnées ou l'ID pour identifier un produit ambassadeur
      const isAmbassador = 
        product.metadata?.type === 'ambassador' || 
        product.name?.toLowerCase().includes('ambassadeur') ||
        productId === 'prod_abcd1234'; // Remplacer par l'ID réel du produit ambassadeur
      
      if (isAmbassador) {
        console.log('Produit ambassadeur identifié:', productId, product.name);
        return true;
      }
    }
    
    // Par défaut, considérer tous les produits gratuits comme ambassadeur pour l'instant
    // Cette logique peut être affinée si nécessaire
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du type d\'abonnement:', error);
    // En cas d'erreur, considérer comme un abonnement payant normal par sécurité
    return false;
  }
}

// Fonction pour déterminer si c'est un essai de 200 jours
function isLongTrialSubscription(subscription: Stripe.Subscription): boolean {
  // Vérifier si c'est un essai et sa durée
  if (subscription.trial_end) {
    const trialDuration = subscription.trial_end - subscription.trial_start;
    const trialDays = Math.floor(trialDuration / (24 * 60 * 60));
    
    // Considérer comme un essai long si c'est plus de 30 jours
    const isLongTrial = trialDays >= 30;
    
    // Vérifier également les métadonnées
    const hasLongTrialMetadata = 
      subscription.metadata?.is_long_trial === 'true' || 
      subscription.metadata?.trial_length === '200_days';
    
    console.log(`Détection d'essai long: ${isLongTrial} (${trialDays} jours), métadonnées: ${hasLongTrialMetadata}`);
    
    return isLongTrial || hasLongTrialMetadata;
  }
  
  return false;
}

// Fonction pour gérer les mises à jour d'abonnement
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Traitement de customer.subscription.updated', subscription.id);
  
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
  const supabase = getSupabaseClient();
  
  try {
    // Rechercher l'abonnement existant
    const { data: existingSubscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id, type, is_long_trial')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    
    if (findError || !existingSubscription) {
      console.error('Abonnement non trouvé:', findError);
      return; // On ne peut pas mettre à jour un abonnement qui n'existe pas
    }
    
    // Extraire la date de fin d'essai si c'est un abonnement avec essai
    let trialEnd = null;
    if (subscription.trial_end) {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
      console.log(`Fin de période d'essai: ${trialEnd}`);
    }
    
    // Déterminer si l'essai se termine et si on passe à un abonnement payant
    const trialEnded = existingSubscription.is_long_trial && !subscription.trial_end && status === 'active';
    
    // Mettre à jour le statut et la date d'expiration
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: status === 'active' ? 'active' : 'inactive',
        expires_at: trialEnd || expiresAt,
        trial_end: trialEnd,
        // Si l'essai est terminé et l'abonnement continue, changer le type en 'paid'
        type: trialEnded ? 'paid' : existingSubscription.type,
        is_long_trial: trialEnded ? false : existingSubscription.is_long_trial
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', updateError);
      throw updateError;
    }
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${existingSubscription.user_id}`);
    
    // Si c'est un ambassadeur, mettre aussi à jour la table ambassador_program
    if (existingSubscription.type === 'ambassador') {
      const { error: ambassadorError } = await supabase
        .from('ambassador_program')
        .update({
          status: status === 'active' ? 'active' : 'inactive',
          expires_at: expiresAt
        })
        .eq('user_id', existingSubscription.user_id);
        
      if (ambassadorError) {
        console.error('Erreur lors de la mise à jour du statut ambassadeur:', ambassadorError);
      } else {
        console.log('Statut ambassadeur mis à jour avec succès');
      }
    }
    
    // Si le statut a changé, mettre à jour dans Brevo également
    if (status !== 'active' || trialEnded) {
      // Obtenir l'email de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', existingSubscription.user_id)
        .single();
      
      if (!userError && userData && userData.email) {
        try {
          let userType = "free";
          
          // Si l'essai long se termine et l'abonnement devient payant
          if (trialEnded) {
            userType = "premium";
            console.log("Essai de 200 jours terminé, l'utilisateur devient membre premium");
          }
          // Si l'abonnement n'est plus actif
          else if (status !== 'active') {
            userType = "free";
            console.log("Abonnement désactivé, l'utilisateur revient à free");
          }
          
          await supabase.functions.invoke('create-brevo-contact', {
            body: { 
              email: userData.email,
              userType: userType,
              source: "subscription_updated"
            }
          });
          console.log(`Utilisateur mis à jour vers le statut ${userType} dans Brevo`);
        } catch (brevoError) {
          console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
        }
      }
    }
  } catch (error) {
    console.error('Erreur dans handleSubscriptionUpdated:', error.message);
    throw error;
  }
}

// Fonction pour gérer la suppression d'abonnement
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Traitement de customer.subscription.deleted', subscription.id);
  
  const subscriptionId = subscription.id;
  const supabase = getSupabaseClient();
  
  try {
    // Rechercher l'abonnement existant
    const { data: existingSubscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id, type')
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
    
    // Si c'est un ambassadeur, mettre aussi à jour la table ambassador_program
    if (existingSubscription.type === 'ambassador') {
      const { error: ambassadorError } = await supabase
        .from('ambassador_program')
        .update({
          status: 'inactive'
        })
        .eq('user_id', existingSubscription.user_id);
        
      if (ambassadorError) {
        console.error('Erreur lors de la mise à jour du statut ambassadeur:', ambassadorError);
      } else {
        console.log('Statut ambassadeur désactivé avec succès');
      }
    }
    
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
    console.error('Erreur dans handleSubscriptionDeleted:', error.message);
    throw error;
  }
}

// Fonction pour gérer la notification de fin d'essai imminente
export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Traitement de customer.subscription.trial_will_end', subscription.id);
  
  const subscriptionId = subscription.id;
  const supabase = getSupabaseClient();
  
  try {
    // Rechercher l'abonnement existant
    const { data: existingSubscription, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id, type, is_long_trial')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    
    if (findError || !existingSubscription) {
      console.error('Abonnement non trouvé:', findError);
      return;
    }
    
    // Traiter spécifiquement les essais de 200 jours
    if (existingSubscription.is_long_trial) {
      // Obtenir l'email de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', existingSubscription.user_id)
        .single();
      
      if (!userError && userData && userData.email) {
        try {
          // Enregistrer que la notification de fin d'essai a été envoyée
          await supabase.from('user_events').insert({
            user_id: existingSubscription.user_id,
            event_type: 'trial_ending_notification',
            metadata: {
              subscription_id: subscriptionId,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              days_remaining: subscription.trial_end ? Math.floor((subscription.trial_end - Date.now() / 1000) / (24 * 60 * 60)) : 0
            }
          });
          
          // Notifier l'utilisateur via Brevo
          await supabase.functions.invoke('create-brevo-contact', {
            body: { 
              email: userData.email,
              userType: "trial_ending", // Type spécial pour les utilisateurs dont l'essai se termine
              source: "trial_ending_notification"
            }
          });
          console.log('Notification de fin d\'essai envoyée via Brevo');
        } catch (brevoError) {
          console.error('Erreur lors de la synchronisation avec Brevo:', brevoError);
        }
      }
    }
  } catch (error) {
    console.error('Erreur dans handleTrialWillEnd:', error.message);
    throw error;
  }
}

// Fonction pour gérer la complétion d'un paiement via checkout
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  console.log('Traitement de checkout.session.completed', session.id);
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
    const isTrial = session.metadata?.isTrial === 'true';
    
    // Vérifier si c'est un produit gratuit (0$) - potentiellement un ambassadeur
    const isZeroAmount = session.amount_total === 0;
    console.log(`Montant total de la session: ${session.amount_total} - Produit gratuit: ${isZeroAmount}`);
    
    // Enregistrer l'événement de paiement réussi
    try {
      await supabase.from('payment_events').insert({
        user_id: userId,
        email: customerEmail,
        plan_type: isZeroAmount ? 'ambassador' : (isTrial ? 'long_trial' : subscriptionType),
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
      
      // Déterminer si c'est un abonnement ambassadeur
      const isAmbassador = isZeroAmount || await isAmbassadorSubscription(subscription, stripe);
      
      // Déterminer si c'est un essai de 200 jours
      const isLongTrial = isTrial || isLongTrialSubscription(subscription);
      
      if (isAmbassador) {
        console.log('Produit ambassadeur détecté dans la session de checkout');
        // Ajouter directement à la table ambassador_program
        try {
          await supabase
            .from('ambassador_program')
            .upsert({
              user_id: userId,
              email: customerEmail,
              status: 'active',
              requested_at: new Date().toISOString(),
              approved_at: new Date().toISOString(),
              notes: `Ajouté via Stripe Checkout - Session ID: ${session.id}`
            }, {
              onConflict: 'user_id'
            });
          console.log('Utilisateur ajouté au programme ambassadeur avec succès');
        } catch (ambassadorError) {
          console.error('Erreur lors de l\'ajout au programme ambassadeur:', ambassadorError);
        }
      }
      
      if (isLongTrial) {
        console.log('Essai long de 200 jours détecté dans la session de checkout');
        
        // Enregistrer l'événement de début d'essai de 200 jours
        try {
          await supabase.from('user_events').insert({
            user_id: userId,
            event_type: 'long_trial_started',
            metadata: {
              subscription_id: subscription.id,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              trial_days: 200
            }
          });
          console.log('Événement de début d\'essai de 200 jours enregistré');
        } catch (eventError) {
          console.error('Erreur lors de l\'enregistrement de l\'événement d\'essai:', eventError);
        }
      }
      
      // Et appeler notre fonction de création d'abonnement
      await handleSubscriptionCreated(subscription, stripe);
    } else {
      console.error('ID d\'abonnement manquant dans la session de checkout');
    }
    
    console.log('Checkout traité avec succès');
  } catch (error) {
    console.error('Erreur dans handleCheckoutCompleted:', error.message);
    throw error;
  }
}
