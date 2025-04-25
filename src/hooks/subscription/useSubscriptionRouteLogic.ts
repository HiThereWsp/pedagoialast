// hooks/useSubscriptionRouteLogic.ts
import { useState, useEffect, useRef } from "react";
import { useSubSubscription } from "@/hooks/subscription";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile"; // Import the new hook
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";
import { supabase } from "@/integrations/supabase/client";
import { hasStoredAdminAccess } from "./accessUtils";

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
      
      // Vérification du localStorage pour éviter les redirections erronées
      const cachedStatus = localStorage.getItem('subscription_status');
      if (cachedStatus) {
        try {
          const parsed = JSON.parse(cachedStatus);
          // Si un statut valide est en cache, autoriser l'accès temporairement
          if (parsed.isActive || parsed.type === 'admin' || parsed.type === 'paid' || 
              parsed.type === 'beta' || parsed.type === 'ambassador') {
            console.log("Utilisation du cache pour autoriser l'accès temporairement");
            setShowContent(true);
          }
        } catch (e) {
          console.error("Erreur lors de l'analyse du cache:", e);
        }
      }
      
      // Vérification du statut admin stocké
      if (hasStoredAdminAccess()) {
        console.log("Accès admin détecté dans le localStorage, accès accordé");
        setShowContent(true);
        return;
      }
      
      // Vérification de l'email utilisateur stocké
      try {
        const lastEmail = localStorage.getItem('last_user_email');
        if (lastEmail === 'andyguitteaud@gmail.com') {
          console.log("Email admin détecté dans le localStorage, accès accordé");
          setShowContent(true);
          return;
        }
      } catch (e) {
        console.error("Erreur lors de la vérification de l'email utilisateur:", e);
      }
      
      return;
    }

    // Stocker l'email pour les vérifications futures
    if (user?.email) {
      try {
        localStorage.setItem('last_user_email', user.email);
        console.log("Email utilisateur stocké pour vérifications futures:", user.email);
      } catch (e) {
        console.error("Erreur lors du stockage de l'email utilisateur:", e);
      }
    }

    // En mode développement, toujours montrer le contenu
    if (import.meta.env.DEV) {
      console.log("Development mode, showing content");
      setShowContent(true);
      return;
    }

    // Vérification directe pour les emails d'administrateur connus
    if (user?.email && user.email.toLowerCase() === 'andyguitteaud@gmail.com') {
      console.log("Utilisateur admin connu, accès accordé directement");
      setShowContent(true);
      return;
    }

    // Si l'utilisateur est abonné, montrer le contenu
    if (isSubscribed) {
      console.log("User is subscribed, showing content");
      setShowContent(true);
      return;
    }

    // Si le profil a des accès spéciaux, montrer le contenu
    if (profile && (profile.is_beta || profile.is_ambassador || profile.is_admin || profile.is_paid_user)) {
      console.log("Special access granted via profile:", {
        is_beta: profile.is_beta,
        is_ambassador: profile.is_ambassador,
        is_admin: profile.is_admin,
        is_paid_user: profile.is_paid_user
      });
      setShowContent(true);
      return;
    }

    // Vérification du statut admin stocké (double vérification)
    if (hasStoredAdminAccess()) {
      console.log("Accès admin détecté dans le localStorage (seconde vérification), accès accordé");
      setShowContent(true);
      return;
    }

    // Par défaut, ne pas montrer le contenu
    setShowContent(false);
  }, [authReady, profile, profileLoading, isSubscribed, user]);

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
    if (!isLoading && !error && !isSubscribed && !showContent) {
      // Log in PostHog for analytics, but only in production
      if (!import.meta.env.DEV) {
        posthog.capture("subscription_required_view", {
          current_path: location.pathname,
          subscription_type: subscriptionType,
        });
      }
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