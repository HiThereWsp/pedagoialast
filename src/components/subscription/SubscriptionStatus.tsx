
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { SubscriptionError } from "./SubscriptionError";
import { LimitedAccessCard } from "./LimitedAccessCard";
import { ActiveSubscriptionCard } from "./ActiveSubscriptionCard";
import { getSubscriptionInfo } from "./utils";
import { supabase } from "@/integrations/supabase/client";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error, checkSubscription } = useSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  
  // Function to manually retry verification
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification en cours...");
    
    try {
      await checkSubscription(true); // Force verification
      toast.success("Vérification terminée");
    } catch (e) {
      toast.error("La vérification a échoué");
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Function to repair ambassador subscription
  const repairAmbassadorSubscription = async (email: string) => {
    if (!email) return;
    
    setIsRepairing(true);
    toast.info("Réparation en cours...");
    
    try {
      // Vérifier si c'est l'email spécifique que nous cherchons à réparer
      if (email !== 'ag.tradeunion@gmail.com') {
        toast.error("Cette fonction est réservée à l'utilisateur spécifique");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('fix-ambassador-subscription', {
        body: { email }
      });
      
      if (error) {
        console.error("Erreur lors de la réparation:", error);
        toast.error("La réparation a échoué: " + error.message);
        return;
      }
      
      if (data && data.success) {
        toast.success(data.message || "Abonnement réparé avec succès");
        
        // Rafraîchir le statut d'abonnement
        setTimeout(() => {
          checkSubscription(true);
        }, 1000);
      } else {
        toast.error("La réparation a échoué: " + (data?.error || "Erreur inconnue"));
      }
    } catch (e) {
      console.error("Exception lors de la réparation:", e);
      toast.error("La réparation a échoué");
    } finally {
      setIsRepairing(false);
    }
  };
  
  // Option pour réparer automatiquement l'abonnement de l'utilisateur spécifique
  const tryAutoRepair = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    
    if (email === 'ag.tradeunion@gmail.com') {
      console.log("Tentative de réparation automatique pour", email);
      await repairAmbassadorSubscription(email);
    }
  };
  
  if (isLoading) {
    return <SubscriptionLoading />;
  }
  
  if (error) {
    // Si c'est l'utilisateur spécifique, proposer la réparation
    const offerRepair = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      return email === 'ag.tradeunion@gmail.com';
    };
    
    return <SubscriptionError 
      error={error} 
      isRetrying={isRetrying} 
      onRetry={handleRetry} 
      onRepair={async () => {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        if (email) {
          repairAmbassadorSubscription(email);
        }
      }}
      showRepair={async () => await offerRepair()}
      isRepairing={isRepairing}
    />;
  }
  
  if (!isSubscribed) {
    // Vérifier si c'est l'utilisateur spécifique et tenter une réparation automatique
    tryAutoRepair();
    return <LimitedAccessCard />;
  }
  
  // Determine subscription type and corresponding display
  const subscriptionInfo = getSubscriptionInfo(subscriptionType);
  
  return (
    <ActiveSubscriptionCard
      subscriptionInfo={subscriptionInfo}
      expiresAt={expiresAt}
      isRetrying={isRetrying}
      onRetry={handleRetry}
    />
  );
}
