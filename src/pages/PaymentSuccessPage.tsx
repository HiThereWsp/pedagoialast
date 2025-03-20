
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const PaymentSuccessPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-redirect to dashboard after a brief delay
    const redirectTimer = setTimeout(() => {
      navigate('/tableaudebord');
    }, 5000);
    
    // Envoyer l'événement de succès d'abonnement à Facebook
    facebookEvents.subscriptionSuccess(
      'unknown', // Type will be verified by webhook
      0,        // Price will be verified by webhook
      0
    );
    
    // Tracking PostHog
    subscriptionEvents.subscriptionCompleted(
      'unknown', // Type will be verified by webhook
      0         // Price will be verified by webhook
    );
    
    // Afficher un toast de confirmation
    toast({
      title: "Abonnement réussi !",
      description: "Votre compte a été activé avec succès.",
      duration: 5000,
    });
    
    return () => clearTimeout(redirectTimer);
  }, [toast, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO 
        title="Abonnement activé | PedagoIA"
        description="Votre abonnement a été activé avec succès. Accédez maintenant à toutes les fonctionnalités de PedagoIA."
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Bienvenue dans PedagoIA</h1>
        
        <p className="text-gray-600 mb-6">
          Votre paiement a été effectué avec succès. Vous allez être redirigé vers votre tableau de bord.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/tableaudebord">
              Accéder à mon tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
