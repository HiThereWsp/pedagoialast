
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const SubscriptionSuccessPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionType = queryParams.get("type") as "monthly" | "yearly" || "monthly";
  
  const subscriptionDetails = {
    monthly: {
      price: 11.90,
      yearlyValue: 142.80,
      title: "Abonnement Mensuel",
      description: "Votre abonnement mensuel à 11,90€ a été activé avec succès."
    },
    yearly: {
      price: 9.00,
      yearlyValue: 108.00,
      title: "Abonnement Annuel",
      description: "Votre abonnement annuel (9€/mois) a été activé avec succès."
    }
  };
  
  const details = subscriptionDetails[subscriptionType];

  useEffect(() => {
    // Envoyer l'événement de succès d'abonnement à Facebook
    facebookEvents.subscriptionSuccess(
      subscriptionType, 
      details.price,
      details.yearlyValue
    );
    
    // Afficher un toast de confirmation
    toast({
      title: "Abonnement réussi !",
      description: "Votre compte a été activé avec succès.",
      duration: 5000,
    });
  }, [subscriptionType, details.price, details.yearlyValue, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO 
        title="Abonnement réussi | PedagoIA"
        description="Votre abonnement a été activé avec succès. Accédez maintenant à toutes les fonctionnalités de PedagoIA."
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{details.title} activé !</h1>
        
        <p className="text-gray-600 mb-6">
          {details.description} Vous pouvez maintenant profiter de toutes les fonctionnalités premium de PedagoIA.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/home">
              Accéder à mon tableau de bord
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/discover">
              Découvrir les fonctionnalités premium
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
