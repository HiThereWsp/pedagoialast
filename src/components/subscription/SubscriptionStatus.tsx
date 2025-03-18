
import { useState } from "react";
import { useSubscription } from "@/hooks/subscription";
import { toast } from "sonner";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { SubscriptionError } from "./SubscriptionError";
import { LimitedAccessCard } from "./LimitedAccessCard";
import { ActiveSubscriptionCard } from "./ActiveSubscriptionCard";
import { getSubscriptionInfo } from "./utils";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error, checkSubscription } = useSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  
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
  
  if (isLoading) {
    return <SubscriptionLoading />;
  }
  
  if (error) {
    return <SubscriptionError 
      error={error} 
      isRetrying={isRetrying} 
      onRetry={handleRetry} 
    />;
  }
  
  if (!isSubscribed) {
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
