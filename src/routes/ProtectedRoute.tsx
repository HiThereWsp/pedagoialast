
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading, authReady } = useAuth();

  // Journalisation améliorée pour le débogage
  useEffect(() => {
    console.log("ProtectedRoute - État d'authentification:", { 
      user: user ? "connecté" : "non connecté", 
      loading, 
      authReady,
      path: location.pathname
    });
  }, [user, loading, authReady, location.pathname]);

  // État de chargement initial, on affiche un indicateur de chargement
  if (loading || !authReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingIndicator />
          <p className="text-sm text-gray-500">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, rediriger vers la page de connexion
  if (!user && authReady) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  return <>{children}</>;
};
