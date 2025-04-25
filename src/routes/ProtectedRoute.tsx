import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { hasStoredAdminAccess } from "@/hooks/subscription/accessUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  const location = useLocation();
  const { user, loading, authReady } = useAuth();
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const initialLoadComplete = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Détermine si la page actuelle est une page publique d'authentification
  const isAuthPage = () => {
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email', '/user-management' , '/chat'];
    return authPaths.some(path => location.pathname.startsWith(path));
  };

  // Vérifier si l'utilisateur a un accès spécial
  const hasSpecialAccess = () => {
    // Vérification admin dans localStorage
    if (hasStoredAdminAccess()) {
      console.log("Accès administrateur détecté dans localStorage");
      return true;
    }
    
    // Vérification email connu
    const lastEmail = localStorage.getItem('last_user_email');
    if (lastEmail === 'andyguitteaud@gmail.com') {
      console.log("Email administrateur connu détecté");
      return true;
    }
    
    // Vérification de l'état de l'abonnement en cache
    try {
      const cachedStatus = localStorage.getItem('subscription_status');
      if (cachedStatus) {
        const parsed = JSON.parse(cachedStatus);
        if (parsed.isActive || parsed.type === 'admin' || parsed.type === 'paid' || 
            parsed.type === 'beta' || parsed.type === 'ambassador') {
          console.log("Statut d'abonnement valide en cache");
          return true;
        }
      }
    } catch (e) {
      console.error("Erreur lors de la vérification du cache d'abonnement:", e);
    }
    
    return false;
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
      email: user?.email,
      loading, 
      authReady,
      path: location.pathname,
      isAuthPage: isAuthPage(),
      initialLoadComplete: initialLoadComplete.current,
      hasSpecialAccess: hasSpecialAccess()
    });
    
    if (authReady && !loading) {
      initialLoadComplete.current = true;
    }
  }, [user, loading, authReady, location.pathname]);

  // Ajoutez cette fonction pour gérer la redirection après un délai
  const handleRedirectToPayment = () => {
    // Nettoyage des timeouts existants
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    // Une dernière vérification avant de planifier la redirection
    if (hasSpecialAccess()) {
      console.log("Redirection évitée grâce à un accès spécial détecté");
      return;
    }
    
    redirectTimeoutRef.current = setTimeout(() => {
      // Vérification finale juste avant la redirection
      if (hasSpecialAccess()) {
        console.log("Redirection annulée au dernier moment - accès spécial détecté");
        window.location.reload(); // Plutôt que rediriger, rechargement
        return;
      }
      
      window.location.href = '/pricing';
    }, 2000); // 2 secondes de délai
  };

  // Ajoutez une fonction de diagnostic
  const diagnoseAuthIssue = () => {
    const authDebug = {
      user: user ? "connecté" : "non connecté",
      email: user?.email,
      authReady,
      specialAccess: hasSpecialAccess(),
      cookies: document.cookie.split(';').map(c => c.trim()),
      localStorage: {
        hasAuthToken: !!localStorage.getItem('supabase.auth.token'),
        hasSubStatus: !!localStorage.getItem('subscription_status'),
        lastUserEmail: localStorage.getItem('last_user_email'),
        isAdminUser: localStorage.getItem('is_admin_user')
      },
      url: window.location.href,
      timestamp: new Date().toString()
    };
    
    console.error("AUTH_DIAGNOSIS:", authDebug);
    
    // Stockez en localStorage pour référence
    localStorage.setItem('auth_diagnosis', JSON.stringify(authDebug));
    
    return authDebug;
  };

  // Nettoyage des timeouts à la démonter
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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

  // Si l'utilisateur a un accès spécial, montrer directement le contenu
  if (hasSpecialAccess()) {
    console.log("Accès spécial détecté, contenu affiché directement");
    return <>{children}</>;
  }

  // Si l'authentification est terminée et qu'aucun utilisateur n'est connecté, 
  // rediriger vers la page de connexion avec un message approprié
  if (!user && authReady && !loading && !isAuthPage()) {
    // Diagnostiquez avant de rediriger
    diagnoseAuthIssue();
    
    // Déclencher la redirection avec délai plus long
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
