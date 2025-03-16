
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type SubscriptionType = 'monthly' | 'yearly';

const PRICE_IDS = {
  monthly: 'price_1R22GyIqXQKnGj4mvQpgJUIR',
  yearly: 'price_1R22GrIqXQKnGj4md4Ce7dgb'
}

export const handleSubscription = async (planType: SubscriptionType, promoCode?: string | null) => {
  // Vérifier la session utilisateur
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Erreur de session:', sessionError);
    toast.error("Erreur de connexion. Veuillez vous reconnecter et réessayer.");
    return "/login";
  }
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    // Stocker l'URL courante pour rediriger après connexion
    return `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }

  try {
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const { data: subscriptionStatus, error: subscriptionError } = await supabase.functions.invoke('check-user-access');
    
    if (subscriptionError) {
      console.error('Erreur lors de la vérification de l\'abonnement:', subscriptionError);
      toast.error("Impossible de vérifier votre abonnement actuel. Veuillez réessayer.");
      return null;
    }
    
    // Si l'utilisateur a déjà un abonnement actif du même type, l'informer
    if (subscriptionStatus.access && subscriptionStatus.type === planType) {
      toast.info("Vous avez déjà un abonnement actif de ce type");
      return null;
    }
    
    // Journaliser l'événement de début de paiement
    try {
      await supabase.functions.invoke('log-payment-start', {
        body: { 
          planType,
          userId: session.user.id,
          email: session.user.email,
          promoCode: promoCode || undefined
        }
      })
    } catch (logError) {
      console.error('Erreur lors de la journalisation du début de paiement:', logError);
      // Continue même si la journalisation échoue
    }
    
    // Timeout pour les appels aux fonctions edge
    const timeout = 15000; // 15 secondes
    
    // Créer une session de paiement Stripe Checkout avec timeout
    const checkoutPromise = supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId: PRICE_IDS[planType],
        subscriptionType: planType,
        productId: planType === 'monthly' ? 'prod_Rvu5l79HX8EAis' : 'prod_Rvu5hv7FxnkHpv',
        promoCode: promoCode || undefined
      }
    });
    
    // Créer une promesse de timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Délai d'attente dépassé pour la création de la session de paiement")), timeout);
    });
    
    // Utiliser Promise.race pour limiter le temps d'attente
    const { data, error } = await Promise.race([checkoutPromise, timeoutPromise]) as any;
    
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
    
    // Enregistrer dans le localStorage la dernière tentative de paiement
    try {
      localStorage.setItem('lastPaymentAttempt', JSON.stringify({
        planType,
        timestamp: Date.now(),
        promoCode: promoCode || null
      }));
    } catch (storageError) {
      console.error('Erreur localStorage:', storageError);
      // Non bloquant
    }
    
    // Rediriger vers la page de paiement Stripe
    window.location.href = data.url;
    
  } catch (error) {
    console.error('Erreur lors de la redirection vers Stripe:', error);
    toast.error("Une erreur est survenue lors de la redirection vers la page de paiement");
    return null;
  }
}
