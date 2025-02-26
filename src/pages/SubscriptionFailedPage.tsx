
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const SubscriptionFailedPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionType = queryParams.get("type") as "monthly" | "yearly" || "monthly";
  const errorType = queryParams.get("error") || "payment_failed";
  
  const subscriptionDetails = {
    monthly: {
      price: 11.90,
      title: "Abonnement Mensuel"
    },
    yearly: {
      price: 9.00,
      title: "Abonnement Annuel"
    }
  };
  
  const details = subscriptionDetails[subscriptionType];

  useEffect(() => {
    // Envoyer l'événement d'échec d'abonnement à Facebook
    facebookEvents.subscriptionFailed(
      subscriptionType, 
      details.price,
      errorType
    );
    
    // Tracking PostHog
    subscriptionEvents.subscriptionFailed(
      subscriptionType,
      errorType
    );
    
    // Afficher un toast d'erreur
    toast({
      variant: "destructive",
      title: "Échec de paiement",
      description: "Une erreur est survenue lors du traitement de votre paiement.",
      duration: 5000,
    });
  }, [subscriptionType, details.price, errorType, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO 
        title="Paiement échoué | PedagoIA"
        description="Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer."
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Paiement non abouti</h1>
        
        <p className="text-gray-600 mb-6">
          Une erreur est survenue lors du traitement de votre paiement pour le {details.title.toLowerCase()}. 
          Aucun montant n'a été débité de votre compte.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/pricing">
              Réessayer
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/contact">
              Contacter le support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFailedPage;
