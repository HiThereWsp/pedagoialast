
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
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const PaymentSuccessPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
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
  
  // Manually verify subscription status function with retry logic
  const verifySubscriptionStatus = async () => {
    console.log(`Verifying subscription status (attempt ${verificationAttempts + 1})`);
    setIsVerifying(true);
    
    try {
      // Clear cache to force a fresh check
      clearSubscriptionCache();
      
      // Force a subscription check
      await checkSubscription(true);
      
      // Attempt to refresh Supabase session to ensure all claims are updated
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
      }
      
      console.log("Subscription verification completed");
      
      // After verification, start countdown for auto-redirect
      startRedirectCountdown();
    } catch (error) {
      console.error("Error verifying subscription status:", error);
      
      // If we haven't reached max attempts, retry after delay using exponential backoff
      if (verificationAttempts < 3) {
        const delay = Math.pow(2, verificationAttempts) * 1000; // 1s, 2s, 4s
        console.log(`Retrying verification in ${delay/1000}s...`);
        
        setTimeout(() => {
          setVerificationAttempts(prev => prev + 1);
          verifySubscriptionStatus();
        }, delay);
      } else {
        console.log("Maximum verification attempts reached, continuing with redirect");
        startRedirectCountdown();
      }
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Start countdown for auto-redirect
  const startRedirectCountdown = () => {
    setRedirectCountdown(5);
    const countdownInterval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate('/tableaudebord');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    const trackPaymentSuccess = async () => {
      try {
        // Track Google Ads conversion
        if (window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16957927011/c3kwCIzhyrAaEOPclZY_',
            'value': details.price,
            'currency': 'EUR',
            'transaction_id': ''
          });
        }
        
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
        await verifySubscriptionStatus();
        
        // Afficher un toast de confirmation
        toast({
          title: "Abonnement réussi !",
          description: "Votre compte a été activé avec succès.",
          duration: 5000,
        });
      } catch (error) {
        console.error("Error in payment success tracking:", error);
      }
    };
    
    trackPaymentSuccess();
  }, []);
  
  // Manual redirect to dashboard
  const handleManualRedirect = () => {
    navigate('/tableaudebord');
  };

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
            ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingIndicator size="sm" />
                Vérification de votre abonnement en cours...
              </span>
            ) 
            : (
              <>
                Votre paiement a été effectué avec succès. 
                {redirectCountdown > 0 && (
                  <span className="block mt-2">
                    Vous allez être redirigé vers votre tableau de bord dans {redirectCountdown} secondes.
                  </span>
                )}
              </>
            )
          }
        </p>
        
        <div className="space-y-4">
          <Button 
            asChild 
            className="w-full" 
            onClick={handleManualRedirect}
            disabled={isVerifying}
          >
            <Link to="/tableaudebord">
              Accéder à mon tableau de bord
            </Link>
          </Button>
          
          {verificationAttempts >= 3 && (
            <div className="text-sm text-amber-600 mt-2">
              La vérification automatique de votre abonnement a rencontré des difficultés. 
              Votre accès sera activé sous peu. Si le problème persiste, veuillez contacter notre support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
