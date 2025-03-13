
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

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
  const { isSubscriptionActive, loading: subscriptionLoading, error: subscriptionError, subscription } = useSubscription();
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const initialLoadComplete = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorShown = useRef(false);

  // Détermine si la page actuelle est une page publique d'authentification
  const isAuthPage = () => {
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email'];
    return authPaths.some(path => location.pathname.startsWith(path));
  };

  // Détermine si la page actuelle est une page liée à l'abonnement
  const isSubscriptionPage = () => {
    const subscriptionPaths = ['/pricing', '/subscription', '/subscription-success', '/checkout-canceled'];
    return subscriptionPaths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  // Détermine si la page actuelle est une page publique (y compris la landing page)
  const isPublicPage = () => {
    const publicPaths = ['/', '/bienvenue', '/waiting-list', '/contact', '/terms', '/privacy', '/legal'];
    return publicPaths.some(path => location.pathname === path) || isAuthPage() || isSubscriptionPage();
  };

  // Vérifier si l'utilisateur est un bêta testeur
  const isBetaTester = () => {
    if (!user?.email) return false;
    
    // Liste des domaines email bêta testeurs
    const betaEmails = [
      '@pedagogia.io',
      '@example.com',
      'andyguitteaud@gmail.com'
    ];
    
    return betaEmails.some(domain => 
      user.email?.includes(domain) || user.email === domain
    );
  };

  // Afficher un message d'erreur pour les erreurs d'abonnement
  useEffect(() => {
    if (subscriptionError && !errorShown.current && user && requireSubscription && !isPublicPage()) {
      errorShown.current = true;
      toast.error(
        "Impossible de vérifier votre abonnement. Vous pouvez continuer à utiliser l'application, mais certaines fonctionnalités peuvent être limitées.",
        { duration: 10000 }
      );
      
      // Réinitialiser après 30 secondes pour permettre un nouveau message si l'erreur persiste
      setTimeout(() => {
        errorShown.current = false;
      }, 30000);
    }
  }, [subscriptionError, user, requireSubscription, isPublicPage]);

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
      subscriptionError: subscriptionError ? true : false,
      subscriptionType: subscription?.type,
      isBetaTester: isBetaTester(),
      path: location.pathname,
      isPublicPage: isPublicPage(),
      isAuthPage: isAuthPage(),
      isSubscriptionPage: isSubscriptionPage(),
      initialLoadComplete: initialLoadComplete.current
    });
    
    if (authReady && !loading && !subscriptionLoading) {
      initialLoadComplete.current = true;
    }
  }, [user, loading, authReady, isSubscriptionActive, subscriptionLoading, subscriptionError, location.pathname, subscription]);

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

  // Si l'utilisateur est un bêta testeur, le laisser accéder à toutes les pages
  if (user && isBetaTester()) {
    console.log("Bêta testeur détecté, accès autorisé");
    return <>{children}</>;
  }

  // Si l'abonnement est requis et que l'utilisateur n'a pas d'abonnement actif,
  // rediriger vers la page de tarification, sauf si c'est déjà une page publique ou de gestion d'abonnement
  if (user && requireSubscription && !isSubscriptionActive() && !subscriptionLoading && !isPublicPage()) {
    console.log("Abonnement requis mais non actif, redirection vers /pricing");
    return <Navigate to="/pricing" replace />;
  }

  // Si l'utilisateur est authentifié ou si c'est une page publique, afficher le contenu
  return <>{children}</>;
};
