
import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { posthog } from "@/integrations/posthog/client";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      // Reduce delay to almost zero to avoid showing the verification message
      const timer = setTimeout(() => setIsChecking(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
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
  
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingIndicator />
          <p className="text-muted-foreground mt-4">Vérification de votre abonnement...</p>
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
                <LoadingIndicator className="mr-2 h-4 w-4" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </>
            )}
          </Button>
          <Button onClick={() => window.location.href = '/contact'}>
            Contacter le support
          </Button>
        </div>
      </div>
    );
  }
  
  // If no active subscription, redirect to pricing page with a clear message
  if (!isSubscribed) {
    // Track in PostHog for analytics
    posthog.capture('subscription_required_view', {
      current_path: window.location.pathname,
      subscription_type: subscriptionType
    });
    
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <Info className="h-5 w-5 text-amber-800" />
          <AlertTitle className="text-amber-800 font-medium">Accès limité</AlertTitle>
          <AlertDescription className="text-amber-700">
            Merci de vous être inscrit à PedagoIA. Cette fonctionnalité nécessite un abonnement actif.
            Découvrez nos offres pour débloquer toutes les fonctionnalités.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.href = '/pricing'}>
            Voir les offres d'abonnement
          </Button>
        </div>
      </div>
    );
  }
  
  // User has a valid subscription or is in development mode, show content
  return children;
};
