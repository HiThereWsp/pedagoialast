
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { isSubscribed, isLoading } = useSubscription();
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
          {/* Message de vérification supprimé */}
        </div>
      </div>
    );
  }
  
  if (!isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }
  
  return children;
};
