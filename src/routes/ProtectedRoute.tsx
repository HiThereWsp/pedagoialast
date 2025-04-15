import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";

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
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email', '/user-management' , '/chat'];
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

  // Ajoutez cette fonction pour gérer la redirection après un délai
  const handleRedirectToPayment = () => {
    setTimeout(() => {
      window.location.href = '/pricing';
    }, 2000); // 2 secondes de délai
  };

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

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, 
  // rediriger vers la page de connexion avec un message approprié
  if (!user && authReady && !loading && !isAuthPage()) {
    // Déclencher la redirection
    handleRedirectToPayment();

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo avec animation de pulse */}
          <div className="mb-8 logo-entrance">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
              alt="PedagoIA" 
              className="h-32 w-auto mx-auto animate-pulse" 
            />
          </div>

          {/* Message avec animation de fade-in */}
          <div className="space-y-4 animate-fade-in">
            <p className="text-xl font-medium text-gray-900">
              Cette fonctionnalité nécessite un accès payant
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers les offres d'abonnement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié ou si c'est une page d'authentification, afficher le contenu

  return <>{children}</>;
};
