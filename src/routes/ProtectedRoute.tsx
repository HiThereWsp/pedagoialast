
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
      }, 1000); // Délai plus long pour éviter les flashs sur connexions rapides
    } else {
      setShowLoadingTimeout(false);
      if (!initialLoadComplete.current && authReady) {
        initialLoadComplete.current = true;
      }
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
          message={showLoadingTimeout ? "Vérification de votre compte..." : undefined}
          submessage={showLoadingTimeout ? "Cela peut prendre quelques instants" : undefined}
        />
      </div>
    );
  }

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, rediriger vers la page de connexion
  if (!user && authReady && !loading) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  return <>{children}</>;
};
