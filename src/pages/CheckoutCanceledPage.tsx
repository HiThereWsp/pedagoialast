
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { SEO } from "@/components/SEO";

const CheckoutCanceledPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionType = queryParams.get("type") as "monthly" | "yearly" || "monthly";
  
  const subscriptionDetails = {
    monthly: {
      title: "Abonnement Mensuel"
    },
    yearly: {
      title: "Abonnement Annuel"
    }
  };
  
  const details = subscriptionDetails[subscriptionType];

  useEffect(() => {
    // Envoyer l'événement d'abandon de paiement à Facebook
    facebookEvents.checkoutCanceled(subscriptionType);
    
    // Tracking PostHog
    subscriptionEvents.subscriptionCanceled(
      subscriptionType, 
      "checkout_page"
    );
  }, [subscriptionType]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO 
        title="Paiement annulé | PedagoIA"
        description="Votre paiement a été annulé. Vous pouvez réessayer à tout moment."
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-gray-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Paiement annulé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous avez annulé le processus d'abonnement pour le {details.title.toLowerCase()}.
          Aucun montant n'a été débité de votre compte.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/pricing">
              Voir les offres
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/home">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCanceledPage;
