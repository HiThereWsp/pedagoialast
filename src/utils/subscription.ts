
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type SubscriptionType = 'monthly' | 'yearly';

const PRICE_IDS = {
  monthly: 'price_1R22GyIqXQKnGj4mvQpgJUIR',
  yearly: 'price_1R22GrIqXQKnGj4md4Ce7dgb'
}

export const handleSubscription = async (planType: SubscriptionType) => {
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
          planType,
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
        priceId: PRICE_IDS[planType],
        subscriptionType: planType,
        productId: planType === 'monthly' ? 'prod_Rvu5l79HX8EAis' : 'prod_Rvu5hv7FxnkHpv'
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
