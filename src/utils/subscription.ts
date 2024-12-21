import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const handleSubscription = async (priceId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    toast.error("Vous devez être connecté pour souscrire à un abonnement")
    return "/login"
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId }
    })

    if (error) throw error
    if (data.error) throw new Error(data.error)
    
    if (data.url) {
      window.location.href = data.url
    }
  } catch (error) {
    console.error('Error:', error)
    toast.error(error.message || "Une erreur est survenue")
    return null
  }
}