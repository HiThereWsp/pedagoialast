// hooks/useSubscriptionRouteLogic.ts
import { useState, useEffect, useRef } from "react";
import { useSubSubscription } from "@/hooks/subscription";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile"; // Import the new hook
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionRouteLogic() {
  const { user, authReady } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user); // Use the new hook
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const checkCount = useRef(0);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Special handling for development mode and user roles
  useEffect(() => {
    if (!authReady || profileLoading) {
      console.log("Waiting for auth or profile to load...");
      return;
    }

    if (profileError || !profile) {
      console.log("Profile error or not found, defaulting to subscription check");
      setShowContent(false); // Default to subscription check if profile fails
      return;
    }

    // Allow access if user is beta, ambassador, or admin
    setShowContent(profile.is_beta || profile.is_ambassador || profile.is_admin);
  }, [authReady, profile, profileLoading, profileError]);

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

  // Effect for handling non-subscribed users
  useEffect(() => {
    // This effect is only for redirecting unsubscribed users
    if (!isLoading && !error && !isSubscribed && !showContent) {
      const redirectTimer = setTimeout(() => {
        safeNavigate("/pricing");
      }, 1500);

      // Log in PostHog for analytics, but only in production
      if (!import.meta.env.DEV) {
        posthog.capture("subscription_required_view", {
          current_path: location.pathname,
          subscription_type: subscriptionType,
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

  // Fix ambassador subscription
  const fixAmbassadorSubscription = async (email: string) => {
    if (!email) return;

    try {
      const { data, error } = await supabase.functions.invoke("fix-ambassador-subscription", {
        body: { email },
      });

      if (error) {
        console.error("Error fixing ambassador subscription:", error);
        toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
        return false;
      }

      console.log("Fix ambassador subscription result:", data);
      toast.success(`Abonnement ambassadeur réparé pour ${email}`);

      // Refresh subscription status
      await checkSubscription(true);

      return true;
    } catch (err) {
      console.error("Exception during ambassador fix:", err);
      toast.error(
          `Exception: ${err instanceof Error ? err.message : "Une erreur inattendue est survenue"}`
      );
      return false;
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
    user,
    fixAmbassadorSubscription,
  };
}