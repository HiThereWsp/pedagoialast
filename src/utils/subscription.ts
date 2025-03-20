
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { clearSubscriptionCache } from "@/hooks/subscription/useSubscriptionCache";

type SubscriptionType = 'monthly' | 'yearly';

// Stripe Payment Links for test environment
const TEST_PAYMENT_LINKS = {
  monthly: 'https://buy.stripe.com/test_cN203tebg49K9uo9AA',
  yearly: 'https://buy.stripe.com/test_4gw7vV3wC49KcGA001'
}

// Payment Links for production environment (to be updated with real links)
const PRODUCTION_PAYMENT_LINKS = {
  monthly: 'https://buy.stripe.com/live_link_for_monthly', // Replace with actual production link
  yearly: 'https://buy.stripe.com/live_link_for_yearly'    // Replace with actual production link
}

// Determine if we're in test mode
const isTestMode = import.meta.env.VITE_STRIPE_TEST_MODE === 'true' || 
                   import.meta.env.DEV || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname.includes('127.0.0.1');

// Choose the appropriate payment links based on environment
console.log(`Mode Stripe: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
const PAYMENT_LINKS = isTestMode ? TEST_PAYMENT_LINKS : PRODUCTION_PAYMENT_LINKS;

export const handleSubscription = async (planType: SubscriptionType) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    // Log the payment start event
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
      // Continue even if logging fails
    }
    
    // Clear subscription cache before redirect to ensure fresh data on return
    clearSubscriptionCache();
    
    // Get the appropriate payment link
    const paymentLink = PAYMENT_LINKS[planType];
    console.log(`Redirection vers le lien de paiement Stripe pour le plan ${planType}: ${paymentLink}`);
    
    // Add the plan type as a query parameter to help the success page identify the subscription type
    const redirectURL = new URL(paymentLink);
    redirectURL.searchParams.append('plan', planType);
    
    // Redirect to the Stripe Payment Link
    window.location.href = redirectURL.toString();
    
    // Return null to indicate we're handling the redirect
    return null;
  } catch (error) {
    console.error('Erreur lors de la redirection vers Stripe:', error);
    toast.error("Une erreur est survenue lors de la redirection vers la page de paiement");
    return null;
  }
}
