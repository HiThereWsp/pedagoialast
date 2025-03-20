
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { SEO } from "@/components/SEO";

const PaymentFailurePage = () => {
  useEffect(() => {
    // Tracking events
    facebookEvents.subscriptionFailed(
      'monthly' as 'monthly' | 'yearly',  // Default to monthly if unknown
      0,         // Price unknown at this point
      'payment_failed'
    );
    
    // Tracking PostHog
    subscriptionEvents.subscriptionFailed(
      'monthly' as 'monthly' | 'yearly',  // Default to monthly if unknown
      'payment_failed'
    );
  }, []);

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
          Votre paiement n'a pas pu être traité correctement. 
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

export default PaymentFailurePage;
