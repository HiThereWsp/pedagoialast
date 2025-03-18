
import { useState, useEffect, useRef } from "react";
import { useSubscription } from "@/hooks/subscription";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";

export function useSubscriptionRouteLogic() {
  const { user } = useAuth();
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const checkCount = useRef(0);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Special handling for development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Development mode detected in SubscriptionRoute, showing content");
      setShowContent(true);
    }
  }, []);
  
  // Special handling for known users
  useEffect(() => {
    // List of emails that should always see content
    const specialEmails = [
      'andyguitteaud@gmail.co',
      'andyguitteaud@gmail.com', 
      'ag.tradeunion@gmail.com'
    ];
    
    if (user?.email && specialEmails.includes(user.email)) {
      console.log(`[DEBUG] Special user detected in SubscriptionRoute: ${user.email}, showing content`);
      setShowContent(true);
    }
  }, [user]);
  
  // Reduce display time - only show verification if it takes unusually long
  useEffect(() => {
    if (isLoading) {
      // Only show loading indicator after a delay (2 seconds)
      const timer = setTimeout(() => setIsChecking(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [isLoading]);
  
  // Limit check count to avoid infinite loops
  useEffect(() => {
    if (isLoading && checkCount.current < 3) {
      checkCount.current += 1;
    }
    
    // Safety measure to always show content if too many checks are happening
    if (checkCount.current >= 3) {
      console.log("Maximum check count reached, forcing content display");
      setShowContent(true);
    }
  }, [isLoading]);
  
  // Effect for handling non-subscribed users
  useEffect(() => {
    // This effect is only for redirecting unsubscribed users
    if (!isLoading && !error && !isSubscribed && !showContent) {
      const redirectTimer = setTimeout(() => {
        safeNavigate('/pricing');
      }, 1500);
      
      // Log in PostHog for analytics, but only in production
      if (!import.meta.env.DEV) {
        posthog.capture('subscription_required_view', {
          current_path: location.pathname,
          subscription_type: subscriptionType
        });
      }
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoading, error, isSubscribed, showContent, location.pathname, subscriptionType]);
  
  // React Router navigation for redirects
  const safeNavigate = (path: string) => {
    console.log(`Safe navigation to: ${path} from: ${location.pathname}`);
    setTimeout(() => navigate(path), 50);
  };
  
  // Retry handler
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification de l'abonnement en cours...");
    
    try {
      await checkSubscription(true); // Force refresh
      toast.success("Vérification terminée");
    } catch (e) {
      toast.error("La vérification a échoué");
    } finally {
      setIsRetrying(false);
    }
  };
  
  return {
    isSubscribed,
    isLoading,
    isChecking,
    error,
    showContent,
    isRetrying,
    handleRetry,
    safeNavigate,
    user
  };
}
