
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useCheckoutSession = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour créer une session de paiement Stripe
  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous abonner.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Appeler l'Edge Function pour créer une session de paiement
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId }
      });

      if (error) {
        console.error("Erreur lors de la création de la session de paiement:", error);
        setError("Erreur lors de la création de la session de paiement");
        toast.error("Erreur lors de la création de la session de paiement. Veuillez réessayer.");
        return null;
      }

      if (!data?.url) {
        setError("Réponse invalide du serveur");
        toast.error("Une erreur est survenue avec le service de paiement");
        return null;
      }

      // Rediriger vers l'URL de checkout Stripe
      return data.url;
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error
  };
};
