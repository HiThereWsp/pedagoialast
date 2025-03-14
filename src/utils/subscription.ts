
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const handleSubscription = async (priceId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    // Determine product IDs and subscription type based on price ID pattern
    let productId;
    let subscriptionType;
    
    if (priceId.includes('monthly')) {
      productId = 'prod_Rvu5l79HX8EAis'; // Monthly plan product ID
      subscriptionType = 'monthly';
    } else {
      productId = 'prod_Rvu5hv7FxnkHpv'; // Yearly plan product ID
      subscriptionType = 'yearly';
    }
    
    console.log('Creating checkout session with:', { priceId, productId, subscriptionType });
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId,
        subscriptionType,
        productId
      }
    })

    if (error) {
      console.error('Error invoking checkout function:', error);
      throw error;
    }
    
    if (data.error) {
      console.error('Error from checkout function:', data.error);
      throw new Error(data.error);
    }
    
    if (data.url) {
      // Use window.location.href for a complete redirect
      window.location.href = data.url;
    } else {
      console.error('No URL returned from checkout function');
      throw new Error("L'URL de paiement n'a pas été générée");
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    toast.error("Une erreur est survenue lors de la création de la session de paiement");
    return null;
  }
}
