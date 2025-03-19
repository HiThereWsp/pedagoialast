
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Fixes an ambassador subscription for a given email
 * Used when webhook processing fails during checkout
 */
export const fixAmbassadorSubscription = async (email: string): Promise<{success: boolean, message: string}> => {
  try {
    toast({
      title: "Réparation en cours",
      description: "Tentative de réparation de l'accès ambassadeur...",
      duration: 3000,
    });
    
    // Call the edge function to fix the ambassador subscription
    const { data, error } = await supabase.functions.invoke('fix-ambassador-subscription', {
      body: { email }
    });
    
    if (error) {
      console.error("Error fixing ambassador subscription:", error);
      return {
        success: false,
        message: `Erreur: ${error.message || "Impossible de réparer l'abonnement"}`
      };
    }
    
    console.log("Ambassador fix response:", data);
    
    if (data.success) {
      // Clear subscription cache to force refresh
      try {
        await supabase.functions.invoke('check-user-access');
      } catch (e) {
        console.log("Cache refresh attempt completed");
      }
      
      return {
        success: true,
        message: data.message || "Abonnement ambassadeur réparé avec succès"
      };
    } else {
      return {
        success: false,
        message: data.error || "Une erreur s'est produite lors de la réparation"
      };
    }
  } catch (err) {
    console.error("Exception during ambassador fix:", err);
    return {
      success: false,
      message: err.message || "Une erreur inattendue s'est produite"
    };
  }
};
