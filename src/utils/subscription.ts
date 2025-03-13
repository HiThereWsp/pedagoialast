
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const handleSubscription = async (priceId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    // Déterminer le type d'abonnement (mensuel ou annuel)
    const subscriptionType = priceId.includes('monthly') ? 'monthly' : 'yearly';
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId,
        subscriptionType,
        productId: priceId.includes('monthly') ? 'prod_Rvu5l79HX8EAis' : 'prod_Rvu5hv7FxnkHpv'
      }
    })

    if (error) throw error
    if (data.error) throw new Error(data.error)
    
    if (data.url) {
      // Utiliser window.location.href pour une redirection complète
      window.location.href = data.url
    } else {
      throw new Error("L'URL de paiement n'a pas été générée")
    }
  } catch (error) {
    console.error('Error:', error)
    toast.error("Une erreur est survenue lors de la création de la session de paiement")
    return null
  }
}
