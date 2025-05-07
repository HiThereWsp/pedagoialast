import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, authReady } = useAuth();
  const location = useLocation();

  // Afficher un loader si l'authent est en cours
  if ((loading || !authReady)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator message="Vérification des droits d'administration..." />
      </div>
    );
  }

  // Si non connecté, rediriger vers login
  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // Si connecté mais sans rôle admin
  if (!user.is_admin && !user.role?.includes('admin')) {
    // Vous pouvez ajuster la condition selon votre schéma de rôle
    return <Navigate to="/" replace />;
  }

  // Autorisé
  return <>{children}</>;
}; 