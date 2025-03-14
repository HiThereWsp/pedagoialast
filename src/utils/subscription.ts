
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const handleSubscription = async (planType: 'monthly' | 'yearly') => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    // Utiliser des liens directs Stripe plutôt que de créer une session de paiement
    let paymentLink;
    
    if (planType === 'monthly') {
      paymentLink = 'https://buy.stripe.com/14k3fuggO8Md9gY3ce'; // Lien de paiement mensuel
    } else {
      paymentLink = 'https://buy.stripe.com/5kA9DS2pYgeF2SA7sw'; // Lien de paiement annuel
    }
    
    console.log('Redirection vers le lien de paiement Stripe pour:', { planType, paymentLink });
    
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
    
    // Rediriger vers la page de paiement Stripe
    window.location.href = paymentLink;
    
  } catch (error) {
    console.error('Erreur lors de la redirection vers Stripe:', error);
    toast.error("Une erreur est survenue lors de la redirection vers la page de paiement");
    return null;
  }
}
