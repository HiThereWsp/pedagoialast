
import React from "react";
import { useLocation } from "react-router-dom";
import { isPublicPage } from "./authUtils";
import { AuthContext } from "./useAuth";

interface AuthLoadingProps {
  children: React.ReactNode;
  loading: boolean;
  authReady: boolean;
  user: any;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ 
  children, 
  loading, 
  authReady, 
  user 
}) => {
  const location = useLocation();

  // Amélioration de la gestion du chargement pour éviter de bloquer l'UI sur les pages publiques
  if (loading && !authReady) {
    // Sur les pages publiques, afficher le contenu même pendant le chargement
    if (isPublicPage(location.pathname)) {
      return (
        <AuthContext.Provider value={{ user: null, loading: true, authReady: false }}>
          {children}
        </AuthContext.Provider>
      );
    }
    
    // Sur les pages privées, montrer l'indicateur de chargement
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}
