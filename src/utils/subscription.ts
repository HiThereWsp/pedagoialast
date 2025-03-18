
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type SubscriptionType = 'monthly' | 'yearly' | 'trial' | 'trial_200days';

const PRICE_IDS = {
  monthly: 'price_1R22GyIqXQKnGj4mvQpgJUIR',
  yearly: 'price_1R22GrIqXQKnGj4md4Ce7dgb',
  trial: 'price_1RaQ8qIqXQKnGj4mLmQMg6yI' // ID du prix pour l'offre d'essai de 200 jours (à 0,50€)
}

export const handleSubscription = async (planType: SubscriptionType, isTrial = false) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    // Journaliser l'événement de début de paiement
    try {
      await supabase.functions.invoke('log-payment-start', {
        body: { 
          planType: isTrial ? 'trial_200' : planType,
          userId: session.user.id,
          email: session.user.email
        }
      })
    } catch (logError) {
      console.error('Erreur lors de la journalisation du début de paiement:', logError);
      // Continue même si la journalisation échoue
    }
    
    // Créer une session de paiement Stripe Checkout
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId: isTrial ? PRICE_IDS.trial : PRICE_IDS[planType],
        subscriptionType: isTrial ? 'trial' : planType,
        productId: isTrial ? 'prod_trial_200days' : (planType === 'monthly' ? 'prod_Rvu5l79HX8EAis' : 'prod_Rvu5hv7FxnkHpv'),
        isTrial: isTrial
      }
    });
    
    if (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      toast.error("Une erreur est survenue lors de la création de la session de paiement");
      return null;
    }
    
    if (!data.url) {
      console.error('URL de checkout manquante dans la réponse');
      toast.error("Une erreur est survenue lors de la redirection vers la page de paiement");
      return null;
    }
    
    console.log('Redirection vers Stripe Checkout:', data.url);
    
    // Rediriger vers la page de paiement Stripe
    window.location.href = data.url;
    
  } catch (error) {
    console.error('Erreur lors de la redirection vers Stripe:', error);
    toast.error("Une erreur est survenue lors de la redirection vers la page de paiement");
    return null;
  }
}

// Nouvelle fonction spécifique pour l'essai de 200 jours
export const handleTrialSubscription = async () => {
  return handleSubscription('trial', true); // On utilise 'trial' comme base, mais avec isTrial=true
}
