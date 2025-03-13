
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

type ProtectedRouteConfig = {
  requireAuth?: boolean;
  requireSubscription?: boolean;
  redirectTo?: string;
  excludedPaths?: string[];
};

export const useAuthMiddleware = (config: ProtectedRouteConfig = {}) => {
  const { 
    requireAuth = true, 
    requireSubscription = true, 
    redirectTo = "/pricing",
    excludedPaths = ["/", "/login", "/signup", "/pricing", "/forgot-password", "/reset-password", "/confirm-email", "/bienvenue"]
  } = config;

  const { user, loading: authLoading } = useAuth();
  const { isSubscriptionActive, loading: subscriptionLoading } = useSubscription();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = () => {
      const currentPath = window.location.pathname;
      
      // Si le chemin est exclu, on autorise toujours
      if (excludedPaths.some(path => currentPath.startsWith(path))) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
      
      // Vérifier l'authentification si nécessaire
      if (requireAuth && !user) {
        navigate("/login", { state: { returnUrl: currentPath } });
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      // Vérifier l'abonnement si nécessaire
      if (requireSubscription && !isSubscriptionActive()) {
        navigate(redirectTo);
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      // Tout est bon, l'utilisateur est autorisé
      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Attendre que l'authentification et la vérification d'abonnement soient terminées
    if (!authLoading && !subscriptionLoading) {
      checkAuthorization();
    }
  }, [
    user, 
    authLoading, 
    isSubscriptionActive, 
    subscriptionLoading, 
    requireAuth, 
    requireSubscription,
    redirectTo,
    excludedPaths,
    navigate
  ]);

  return { isAuthorized, isLoading };
};
