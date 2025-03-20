
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type SubscriptionType = 'monthly' | 'yearly';

// Prix en environnement de production
const PRODUCTION_PRICE_IDS = {
  monthly: 'price_1R22GyIqXQKnGj4mvQpgJUIR',
  yearly: 'price_1R22GrIqXQKnGj4md4Ce7dgb'
}

// Prix en environnement de test
const TEST_PRICE_IDS = {
  monthly: 'price_1R4arFIqXQKnGj4moBiz4Ynk',
  yearly: 'price_1R4arkIqXQKnGj4m5jbu0rkk'
}

// Déterminer explicitement si nous utilisons le mode test de Stripe
// D'abord vérifier la variable d'environnement VITE_STRIPE_TEST_MODE
// Ensuite vérifier si nous sommes en environnement de développement
const isTestMode = import.meta.env.VITE_STRIPE_TEST_MODE === 'true' || 
                   import.meta.env.DEV || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname.includes('127.0.0.1');

// Choix des prix basé sur le mode test/production
console.log(`Mode Stripe: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
const PRICE_IDS = isTestMode ? TEST_PRICE_IDS : PRODUCTION_PRICE_IDS;

// Identifiants des produits correspondant aux abonnements
const PRODUCT_IDS = {
  // En mode test
  test: {
    monthly: 'prod_PhxCwgFv4eZrxr',
    yearly: 'prod_PhxCW9m0ZDdU2o'
  },
  // En production
  production: {
    monthly: 'prod_Rvu5l79HX8EAis',
    yearly: 'prod_Rvu5hv7FxnkHpv'
  }
};

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
    
    const selectedPriceId = PRICE_IDS[planType];
    console.log(`Création de session de paiement avec ID de prix: ${selectedPriceId}`);
    console.log(`Mode de paiement Stripe: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
    
    // Déterminer l'ID du produit correspondant en utilisant le bon environnement
    const productId = PRODUCT_IDS[isTestMode ? 'test' : 'production'][planType];
    console.log(`ID du produit sélectionné: ${productId}`);
    
    // Créer une session de paiement Stripe Checkout
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId: selectedPriceId,
        subscriptionType: planType,
        productId: productId,
        testMode: isTestMode  // Passer l'information du mode test à la fonction
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
