import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { supabase } from "@/integrations/supabase/client";
import { pricingEvents } from "@/integrations/posthog/events";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { trackPurchaseConversion } from "@/integrations/google-analytics/client";

// Interface for the Checkout Session data
interface CheckoutSessionData {
  subscriptionType: string;
  planName: string;
  amount: number;
  trialEnd?: string; // ISO date string
  nextBillingDate: string; // ISO date string
  customerEmail: string;
  metadata?: Record<string, string>;
  clientReferenceId?: string;
  sessionId: string;
  customerId: string;
  subscriptionId: string;
}

export default function PaymentSuccessPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trackPaymentSuccess = async () => {
      try {
        // Get subscription type and client_id from URL params
        const urlParams = new URLSearchParams(location.search);
        const subscriptionType = urlParams.get("type") as "monthly" | "yearly" || "monthly";
        const clientId = urlParams.get("client_id") || undefined;
        
        if (!sessionData) return;

        // Track Google Analytics conversion with enhanced data
        trackPurchaseConversion(
          sessionData.sessionId || '',
          sessionData.amount,
          'EUR',
          sessionData.subscriptionType,
          clientId || sessionData.clientReferenceId
        );
        
        // Calculating yearly value for tracking
        const yearlyValue = subscriptionType === "monthly" 
          ? sessionData.amount * 12 
          : sessionData.amount;
        
        // Send subscription success event to Facebook
        facebookEvents.subscriptionSuccess(
          subscriptionType,
          sessionData.amount,
          yearlyValue
        );
        
        // Tracking PostHog with enhanced data
        subscriptionEvents.subscriptionCompleted(
          subscriptionType,
          sessionData.amount,
          {
            session_id: sessionData.sessionId,
            customer_id: sessionData.customerId,
            plan_name: sessionData.planName,
            client_id: clientId || sessionData.clientReferenceId,
            metadata: sessionData.metadata
          }
        );
        
        // Display a confirmation toast
        toast({
          title: "Abonnement réussi !",
          description: "Votre compte a été activé avec succès.",
          duration: 5000,
        });
      } catch (error) {
        console.error("Error in payment success tracking:", error);
      }
    };

    const fetchSessionDetails = async () => {
      try {
        // Extract session_id and subscription type from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        const subscriptionType = urlParams.get("type");

        if (!sessionId || !subscriptionType) {
          throw new Error("Missing session_id or subscription type in URL parameters");
        }

        // Call the Supabase Edge Function to retrieve session details
        const { data, error } = await supabase.functions.invoke("get-checkout-session", {
          body: { sessionId },
        });

        if (error) {
          throw new Error(error.message || "Failed to fetch session details");
        }

        if (!data) {
          throw new Error("No session data returned from server");
        }
        
        setSessionData(data);
        
        // Run tracking after session data is available
        await trackPaymentSuccess();
        
        // Navigate to /home after 5 seconds
        setTimeout(() => {
          navigate("/home");
        }, 5000);
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast({
          title: "Erreur lors de la récupération des détails de la session",
          description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [toast, navigate, location.search]);

  return (
    <>
      <SEO
        title="Paiement réussi | PedagoIA - Bienvenue !"
        description="Votre abonnement a été créé avec succès. Commencez à utiliser PedagoIA dès maintenant !"
      />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/home" className="block mb-8">
            <img
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
              alt="PedagoIA Logo"
              className="w-[100px] h-[120px] object-contain mx-auto"
            />
          </Link>
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-primary mb-4">
                Paiement réussi !
              </h1>
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <LoadingIndicator />
                  <p className="text-lg text-muted-foreground">
                    Chargement des détails de votre abonnement...
                  </p>
                </div>
              ) : sessionData ? (
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
              ) : (
                <p className="text-lg text-muted-foreground">
                  Une erreur s'est produite lors de la récupération des détails de votre abonnement.
                </p>
              )}
            </div>
            {!loading && (
              <div className="text-center">
                <Button asChild>
                  <Link to="/dashboard">Commencer à utiliser PedagoIA</Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
