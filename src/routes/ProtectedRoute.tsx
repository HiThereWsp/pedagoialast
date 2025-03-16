
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading, authReady } = useAuth();
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const initialLoadComplete = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Détermine si la page actuelle est une page publique d'authentification
  const isAuthPage = () => {
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email'];
    return authPaths.some(path => location.pathname.startsWith(path));
  };

  // Montrer le chargement seulement après un délai pour éviter les flashs
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (loading || !authReady) {
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
  }, [loading, authReady]);

  // Journalisation améliorée pour le débogage
  useEffect(() => {
    console.log("ProtectedRoute - État d'authentification:", { 
      user: user ? "connecté" : "non connecté", 
      loading, 
      authReady,
      path: location.pathname,
      isAuthPage: isAuthPage(),
      initialLoadComplete: initialLoadComplete.current
    });
    
    if (authReady && !loading) {
      initialLoadComplete.current = true;
    }
  }, [user, loading, authReady, location.pathname]);

  // État de chargement initial, afficher l'indicateur de chargement seulement après le délai
  if ((loading || !authReady) && !initialLoadComplete.current) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator 
          message={showLoadingTimeout ? "Vérification de l'authentification..." : undefined}
          submessage={showLoadingTimeout ? "Cela prend plus de temps que prévu" : undefined}
        />
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à une page d'authentification,
  // rediriger vers la page d'accueil
  if (user && isAuthPage()) {
    console.log("Utilisateur déjà authentifié, redirection vers /bienvenue");
    return <Navigate to="/bienvenue" replace />;
  }

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, 
  // rediriger vers la page de connexion, sauf si c'est déjà une page d'authentification
  if (!user && authReady && !loading && !isAuthPage()) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // Si l'utilisateur est authentifié ou si c'est une page d'authentification, afficher le contenu
  return <>{children}</>;
};
