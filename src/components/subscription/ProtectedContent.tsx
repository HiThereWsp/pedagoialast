
import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProtectedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedContent = ({ children, fallback }: ProtectedContentProps) => {
  const { loading, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();

  // Pendant le chargement, afficher un état de chargement
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Si l'abonnement est actif, afficher le contenu normal
  if (isSubscriptionActive()) {
    return (
      <>
        <SubscriptionBanner />
        {children}
      </>
    );
  }

  // Si un contenu de repli est fourni, l'utiliser
  if (fallback) {
    return (
      <>
        <SubscriptionBanner />
        {fallback}
      </>
    );
  }

  // Sinon, afficher un message d'accès restreint par défaut
  return (
    <>
      <SubscriptionBanner />
      <Card className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Accès restreint</h2>
        <p className="text-muted-foreground mb-6">
          Cette fonctionnalité nécessite un abonnement actif. Veuillez vous abonner pour y accéder.
        </p>
        <Button onClick={() => navigate("/pricing")}>
          Voir les offres d'abonnement
        </Button>
      </Card>
    </>
  );
};
