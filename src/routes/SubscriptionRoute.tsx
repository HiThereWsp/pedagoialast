
import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { isSubscribed, subscriptionType, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      // Réduire le délai à presque zéro pour éviter l'affichage du message de vérification
      const timer = setTimeout(() => setIsChecking(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info("Vérification de l'abonnement en cours...");
    
    try {
      await checkSubscription(true); // Forcer l'actualisation
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
  
  // Si une erreur s'est produite, afficher un message d'erreur avec possibilité de réessayer
  if (error) {
    console.error('Erreur de vérification d\'abonnement:', error);
    
    // Si nous sommes en mode développement, permettre l'accès malgré l'erreur
    if (import.meta.env.DEV) {
      console.log('Mode développement détecté, accès accordé malgré l\'erreur');
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
  
  // Si pas d'abonnement actif, rediriger vers la page pricing avec un message clair
  if (!isSubscribed) {
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <Info className="h-5 w-5 text-amber-800" />
          <AlertTitle className="text-amber-800 font-medium">Abonnement requis</AlertTitle>
          <AlertDescription className="text-amber-700">
            Cette fonctionnalité nécessite un abonnement actif pour être utilisée. 
            Consultez nos offres pour débloquer toutes les fonctionnalités.
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
  
  // L'utilisateur a un abonnement valide ou est en mode développement, afficher le contenu
  return children;
};
