import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import metaConversionsService from "@/services/metaConversionsService";

const SubscriptionSuccessPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionType = queryParams.get("type") as "monthly" | "yearly" || "monthly";
  const subscriptionIdParam = queryParams.get("subscription_id");
  
  const subscriptionDetails = {
    monthly: {
      price: 11.90,
      yearlyValue: 142.80,
    },
    yearly: {
      price: 9.00,
      yearlyValue: 108.00,
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
    
    // Envoyer l'événement de succès d'abonnement via l'API Conversions (Serveur)
    if (user) {
      const testEventCode = import.meta.env.VITE_META_TEST_EVENT_CODE || undefined;
      console.log(`[Meta CAPI] Sending Subscription Success event (Test Code: ${testEventCode || 'None'})`);
      metaConversionsService.sendSubscriptionSuccessEvent(
        {
          email: user.email,
          firstName: user.user_metadata?.firstName,
          subscriptionId: subscriptionIdParam || undefined
        },
        subscriptionType,
        details.price,
        details.yearlyValue,
        {
          event_source_url: window.location.href,
          test_event_code: testEventCode
        }
      ).catch(error => {
        console.error(`[Meta CAPI] Failed to send Subscription Success event (Test Code: ${testEventCode || 'None'}):`, error);
      });
    } else {
      console.warn('[Meta CAPI] User data not available, skipping server-side event.');
    }
    
    // Tracking PostHog
    subscriptionEvents.subscriptionCompleted(
      subscriptionType, 
      details.price
    );
    
    // Afficher un toast de confirmation
    toast({
      title: "Abonnement réussi !",
      description: "Votre compte a été activé avec succès.",
      duration: 5000,
    });
  }, [subscriptionType, details.price, details.yearlyValue, toast, user, subscriptionIdParam]);

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
        
        <h1 className="text-2xl font-bold mb-2">Abonnement activé</h1>
        
        <p className="text-gray-600 mb-6">
          Bienvenue sur PedagoIA, l'application qui révolutionne l'enseignement !
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/home">
              Accéder à mon tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
