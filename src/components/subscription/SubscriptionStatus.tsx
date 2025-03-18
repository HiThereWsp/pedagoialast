
import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/subscription";
import { toast } from "sonner";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { SubscriptionError } from "./SubscriptionError";
import { LimitedAccessCard } from "./LimitedAccessCard";
import { ActiveSubscriptionCard } from "./ActiveSubscriptionCard";
import { getSubscriptionInfo } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { clearSubscriptionCache } from "@/hooks/subscription/useSubscriptionCache";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error, checkSubscription } = useSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  
  // Function to manually retry verification
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification en cours...");
    
    try {
      // Clear cache first to force fresh check
      clearSubscriptionCache();
      await checkSubscription(true); // Force verification
      toast.success("Vérification terminée");
    } catch (e) {
      toast.error("La vérification a échoué");
      console.error("Verification error:", e);
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
      // Validate it's the specific ambassador we want to fix
      if (email !== 'ag.tradeunion@gmail.com') {
        console.log("Not the target ambassador email:", email);
        toast.error("Cette fonction est réservée à l'utilisateur spécifique");
        return;
      }
      
      console.log("Calling fix-ambassador-subscription for:", email);
      const { data, error } = await supabase.functions.invoke('fix-ambassador-subscription', {
        body: { email }
      });
      
      if (error) {
        console.error("Repair error:", error);
        toast.error("La réparation a échoué: " + error.message);
        return;
      }
      
      if (data && data.success) {
        toast.success(data.message || "Abonnement réparé avec succès");
        
        // Clear cache and refresh status
        clearSubscriptionCache();
        
        // Refresh subscription status after a short delay
        setTimeout(() => {
          checkSubscription(true);
        }, 1000);
      } else {
        console.error("Repair failed:", data);
        toast.error("La réparation a échoué: " + (data?.error || "Erreur inconnue"));
      }
    } catch (e) {
      console.error("Exception during repair:", e);
      toast.error("La réparation a échoué: exception");
    } finally {
      setIsRepairing(false);
    }
  };
  
  // Auto-repair for specific ambassador
  const tryAutoRepair = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      
      if (email === 'ag.tradeunion@gmail.com') {
        console.log("Attempting automatic repair for:", email);
        await repairAmbassadorSubscription(email);
      }
    } catch (e) {
      console.error("Auto-repair error:", e);
    }
  };
  
  if (isLoading) {
    return <SubscriptionLoading />;
  }
  
  if (error) {
    // If it's the specific ambassador, offer repair
    const offerRepair = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        return email === 'ag.tradeunion@gmail.com';
      } catch (e) {
        console.error("Error checking repair eligibility:", e);
        return false;
      }
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
    // For the specific ambassador, attempt auto-repair
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
