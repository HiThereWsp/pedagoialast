import { useState, useEffect } from "react";
import { useSubSubscription } from "@/hooks/subscription";
import { toast } from "sonner";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { SubscriptionError } from "./SubscriptionError";
import { SubscriptionRedirect } from "./SubscriptionRedirect";
import { ActiveSubscriptionCard } from "./ActiveSubscriptionCard";
import { getSubscriptionInfo } from "./utils";
import { clearSubscriptionCache } from "@/hooks/subscription/useSubscriptionCache";

export function SubscriptionStatus() {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error, checkSubscription } = useSubSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Auto-verify subscription on initial load and after payment return
  useEffect(() => {
    // Check for payment_success or payment_redirect in the URL
    if (window.location.search.includes('payment_success') || 
        window.location.search.includes('payment_redirect')) {
      handleRetry();
    }
  }, []);
  
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
    return <SubscriptionRedirect />;
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
