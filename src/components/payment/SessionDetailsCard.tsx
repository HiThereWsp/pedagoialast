
import { CheckoutSessionData } from "@/types/checkout-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface SessionDetailsCardProps {
  sessionData: CheckoutSessionData | null;
  loading: boolean;
}

export const SessionDetailsCard = ({ sessionData, loading }: SessionDetailsCardProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <LoadingIndicator />
        <p className="text-lg text-muted-foreground">
          Chargement des détails de votre abonnement...
        </p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <p className="text-lg text-muted-foreground">
        Une erreur s'est produite lors de la récupération des détails de votre abonnement.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg text-muted-foreground">
        Merci d'avoir souscrit au{" "}
        <span className="font-semibold">{sessionData.planName}</span> !
      </p>
      <p className="text-muted-foreground">
        Un email de confirmation a été envoyé à{" "}
        <span className="font-semibold">{sessionData.customerEmail}</span>.
      </p>
      {sessionData.trialEnd ? (
        <p className="text-muted-foreground">
          Votre essai gratuit se termine le{" "}
          <span className="font-semibold">
            {new Date(sessionData.trialEnd).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Votre prochain paiement de {sessionData.amount} € sera dû le{" "}
          <span className="font-semibold">
            {new Date(sessionData.nextBillingDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Vous serez redirigé vers la page d'accueil dans 5 secondes...
      </p>
    </div>
  );
};
