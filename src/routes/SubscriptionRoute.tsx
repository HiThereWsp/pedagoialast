
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/subscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { user } = useAuth();
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const checkCount = useRef(0);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Special handling for development mode - always called regardless of conditions
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Development mode detected in SubscriptionRoute, showing content");
      setShowContent(true);
    }
  }, []);
  
  // Special handling for known users - always called regardless of conditions
  useEffect(() => {
    // List of emails that should always see content
    const specialEmails = [
      'andyguitteaud@gmail.co',
      'andyguitteaud@gmail.com', 
      'ag.tradeunion@gmail.com'
    ];
    
    if (user?.email && specialEmails.includes(user.email)) {
      console.log(`[DEBUG] Special user detected in SubscriptionRoute: ${user.email}, showing content`);
      setShowContent(true);
    }
  }, [user]);
  
  // Reduce display time - only show verification if it takes unusually long
  // Always call this hook regardless of conditions
  useEffect(() => {
    if (isLoading) {
      // Only show loading indicator after a delay (2 seconds)
      const timer = setTimeout(() => setIsChecking(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [isLoading]);
  
  // Limit check count to avoid infinite loops - always called regardless of conditions
  useEffect(() => {
    if (isLoading && checkCount.current < 3) {
      checkCount.current += 1;
    }
    
    // Safety measure to always show content if too many checks are happening
    if (checkCount.current >= 3) {
      console.log("Maximum check count reached, forcing content display");
      setShowContent(true);
    }
  }, [isLoading, checkCount.current]);

  // React Router navigation for redirects - always defined regardless of conditions
  const safeNavigate = (path: string) => {
    console.log(`Safe navigation to: ${path} from: ${location.pathname}`);
    setTimeout(() => navigate(path), 50);
  };
  
  // Retry handler - always defined regardless of conditions
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification de l'abonnement en cours...");
    
    try {
      await checkSubscription(true); // Force refresh
      toast.success("Vérification terminée");
    } catch (e) {
      toast.error("La vérification a échoué");
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Effect for handling non-subscribed users
  useEffect(() => {
    // This effect is only for redirecting unsubscribed users
    if (!isLoading && !error && !isSubscribed && !showContent) {
      const redirectTimer = setTimeout(() => {
        safeNavigate('/pricing');
      }, 1500);
      
      // Log in PostHog for analytics, but only in production
      if (!import.meta.env.DEV) {
        posthog.capture('subscription_required_view', {
          current_path: location.pathname,
          subscription_type: subscriptionType
        });
      }
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoading, error, isSubscribed, showContent, location.pathname, subscriptionType, safeNavigate]);
  
  // Rendering logic based on conditions - but all hooks are always called above
  // Now we can use early returns without breaking hooks rules
  
  // If special access is granted, show content immediately
  if (showContent) {
    return children;
  }
  
  // Only show loading during unusually long verifications and not in dev mode
  if (isLoading && isChecking && !import.meta.env.DEV) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] transition-opacity duration-300">
        <div className="text-center">
          <LoadingIndicator type="spinner" size="md" />
          <p className="text-muted-foreground mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
  
  // If an error occurred, display an error message with retry option
  if (error) {
    console.error('Subscription verification error:', error);
    
    // In development mode, allow access despite error
    if (import.meta.env.DEV) {
      console.log('Development mode detected, access granted despite error');
      return children;
    }

    // Skip the error for special users or ambassador accounts
    if (user?.email === 'ag.tradeunion@gmail.com') {
      console.log("Ambassador account detected, bypassing error");
      return children;
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-medium">Erreur de vérification d'abonnement</AlertTitle>
          <AlertDescription className="text-red-700">
            Une erreur est survenue lors de la vérification de votre abonnement. 
            Vous pouvez essayer de réactualiser ou contacter notre support si le problème persiste.
          </AlertDescription>
        </Alert>
        
        <details className="mb-6 text-xs text-gray-600">
          <summary className="cursor-pointer font-medium">Détails techniques</summary>
          <p className="mt-1 p-2 bg-gray-100 rounded">{error}</p>
        </details>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outline"
          >
            {isRetrying ? (
              <>
                <LoadingIndicator size="sm" type="spinner" className="mr-2" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </>
            )}
          </Button>
          <Button onClick={() => safeNavigate('/contact')}>
            Contacter le support
          </Button>
        </div>
      </div>
    );
  }
  
  // If no active subscription, show subscription required message
  if (!isSubscribed) {
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <Info className="h-5 w-5 text-amber-800" />
          <AlertTitle className="text-amber-800 font-medium">Accès limité</AlertTitle>
          <AlertDescription className="text-amber-700">
            Abonnez vous pour avoir accès à toutes les fonctionnalités de PedagoIA.
            <div className="mt-2">Redirection vers la page d'abonnement...</div>
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => safeNavigate('/pricing')}>
            Voir les offres d'abonnement
          </Button>
        </div>
      </div>
    );
  }
  
  // User has a valid subscription, show content
  return children;
};
