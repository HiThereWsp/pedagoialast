
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireSubscription = true
}) => {
  const location = useLocation();
  const { user, loading, authReady } = useAuth();
  const { isSubscriptionActive, loading: subscriptionLoading } = useSubscription();
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const initialLoadComplete = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Détermine si la page actuelle est une page publique d'authentification
  const isAuthPage = () => {
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email'];
    return authPaths.some(path => location.pathname.startsWith(path));
  };

  // Détermine si la page actuelle est une page publique (y compris la landing page)
  const isPublicPage = () => {
    const publicPaths = ['/', '/bienvenue', '/waiting-list', '/contact', '/pricing', '/terms', '/privacy', '/legal'];
    return publicPaths.some(path => location.pathname === path) || isAuthPage();
  };

  // Montrer le chargement seulement après un délai pour éviter les flashs
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if ((loading || !authReady || subscriptionLoading) && !isPublicPage()) {
      timeoutRef.current = setTimeout(() => {
        if (!initialLoadComplete.current) {
          setShowLoadingTimeout(true);
        }
      }, 800); // Un peu plus long pour éviter les flashs sur connexions rapides
    } else {
      setShowLoadingTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, authReady, subscriptionLoading, isPublicPage]);

  // Journalisation améliorée pour le débogage
  useEffect(() => {
    console.log("ProtectedRoute - État d'authentification:", { 
      user: user ? "connecté" : "non connecté", 
      loading, 
      authReady,
      subscription: isSubscriptionActive() ? "active" : "inactive",
      subscriptionLoading,
      path: location.pathname,
      isPublicPage: isPublicPage(),
      isAuthPage: isAuthPage(),
      initialLoadComplete: initialLoadComplete.current
    });
    
    if (authReady && !loading && !subscriptionLoading) {
      initialLoadComplete.current = true;
    }
  }, [user, loading, authReady, isSubscriptionActive, subscriptionLoading, location.pathname]);

  // État de chargement initial, afficher l'indicateur de chargement seulement après le délai
  if ((loading || !authReady || (requireSubscription && subscriptionLoading)) && !initialLoadComplete.current && !isPublicPage()) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator 
          message={showLoadingTimeout ? "Vérification de l'accès..." : undefined}
          submessage={showLoadingTimeout ? "Cela prend plus de temps que prévu" : undefined}
        />
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à une page d'authentification,
  // rediriger vers la page d'accueil
  if (user && isAuthPage()) {
    console.log("Utilisateur déjà authentifié, redirection vers /home");
    return <Navigate to="/home" replace />;
  }

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, 
  // rediriger vers la page de connexion, sauf si c'est déjà une page publique
  if (!user && authReady && !loading && !isPublicPage()) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // Si l'abonnement est requis et que l'utilisateur n'a pas d'abonnement actif,
  // rediriger vers la page de tarification, sauf si c'est déjà une page publique
  if (user && requireSubscription && !isSubscriptionActive() && !subscriptionLoading && !isPublicPage() && !location.pathname.startsWith('/pricing')) {
    console.log("Abonnement requis mais non actif, redirection vers /pricing");
    return <Navigate to="/pricing" replace />;
  }

  // Si l'utilisateur est authentifié ou si c'est une page publique, afficher le contenu
  return <>{children}</>;
};
