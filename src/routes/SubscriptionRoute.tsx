
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { toast } from "sonner";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { isSubscribed, subscriptionType, expiresAt, isLoading, error } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      // Réduire le délai à presque zéro pour éviter l'affichage du message de vérification
      const timer = setTimeout(() => setIsChecking(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    // Afficher une notification si l'abonnement expire bientôt
    if (isSubscribed && expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        toast.warning(
          `Votre ${subscriptionType === 'beta' ? 'accès beta' : 'abonnement'} expire dans ${daysUntilExpiry} jours.`, 
          {
            duration: 6000,
            action: {
              label: 'Renouveler',
              onClick: () => window.location.href = '/pricing'
            }
          }
        );
      }
    }
  }, [isSubscribed, expiresAt, subscriptionType]);
  
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingIndicator />
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error("Erreur de vérification d'abonnement:", error);
    toast.error("Erreur lors de la vérification de votre abonnement. Veuillez réessayer.");
  }
  
  if (!isSubscribed) {
    // Rediriger vers la page de tarification
    toast.info("Abonnement requis pour accéder à cette fonctionnalité");
    return <Navigate to="/pricing" replace />;
  }
  
  return children;
};
