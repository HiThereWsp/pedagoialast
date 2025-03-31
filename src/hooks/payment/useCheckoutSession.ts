
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutSessionData } from "@/types/checkout-session";

export const useCheckoutSession = (sessionId?: string, subscriptionType?: string) => {
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId || !subscriptionType) {
        setLoading(false);
        return;
      }

      try {
        // Call the Supabase Edge Function to retrieve session details
        const { data, error } = await supabase.functions.invoke("get-checkout-session", {
          body: { sessionId },
        });

        if (error) {
          throw new Error(error.message || "Failed to fetch session details");
        }

        if (!data) {
          throw new Error("No session data returned from server");
        }
        
        setSessionData(data);
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast({
          title: "Erreur lors de la récupération des détails de la session",
          description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId, subscriptionType, toast]);

  return { sessionData, loading };
};
