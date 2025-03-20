
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { clearSubscriptionCache } from "@/hooks/subscription/useSubscriptionCache";
import { useSubscription } from "@/hooks/useSubscription";

const PaymentSuccessPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const { checkSubscription } = useSubscription();
  
  // Get subscription type from URL params
  const queryParams = new URLSearchParams(location.search);
  const subscriptionType = (queryParams.get("plan") || "monthly") as "monthly" | "yearly";
  
  const subscriptionDetails = {
    monthly: {
      price: 11.90,
      yearlyValue: 142.80,
    },
    yearly: {
      price: 119.0,
      yearlyValue: 142.80,
    }
  };

  const details = subscriptionDetails[subscriptionType];
  
  useEffect(() => {
    const verify = async () => {
      setIsVerifying(true);
      
      try {
        // Clear cache to force a fresh check
        clearSubscriptionCache();
        
        // Force a subscription check to update status immediately
        await checkSubscription(true);
        
        console.log("Subscription status verified after successful payment");
      } catch (error) {
        console.error("Error verifying subscription status:", error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    // Envoyer l'événement de succès d'abonnement à Facebook
    facebookEvents.subscriptionSuccess(
      subscriptionType,
      details.price,
      details.yearlyValue
    );
    
    // Tracking PostHog
    subscriptionEvents.subscriptionCompleted(
      subscriptionType,
      details.price
    );
    
    // Verify subscription status
    verify();
    
    // Auto-redirect to dashboard after delay
    const redirectTimer = setTimeout(() => {
      navigate('/tableaudebord');
    }, 5000);
    
    // Afficher un toast de confirmation
    toast({
      title: "Abonnement réussi !",
      description: "Votre compte a été activé avec succès.",
      duration: 5000,
    });
    
    return () => clearTimeout(redirectTimer);
  }, [toast, navigate, checkSubscription, subscriptionType, details.price, details.yearlyValue]);

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
          {isVerifying 
            ? "Vérification de votre abonnement en cours..." 
            : "Votre paiement a été effectué avec succès. Vous allez être redirigé vers votre tableau de bord."}
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
