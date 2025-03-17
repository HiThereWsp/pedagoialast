
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { isSubscribed, subscriptionType, isLoading, error } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      // Réduire le délai à presque zéro pour éviter l'affichage du message de vérification
      const timer = setTimeout(() => setIsChecking(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingIndicator />
          <p className="text-muted-foreground mt-4">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }
  
  // Si une erreur s'est produite, afficher un message mais laisser l'utilisateur continuer
  if (error) {
    console.error('Erreur de vérification d\'abonnement:', error);
    // Si nous sommes en mode développement, permettre l'accès malgré l'erreur
    if (import.meta.env.DEV) {
      console.log('Mode développement détecté, accès accordé malgré l\'erreur');
      return children;
    }
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
