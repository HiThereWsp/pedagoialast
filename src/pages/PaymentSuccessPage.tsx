import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client"
import { pricingEvents } from "@/integrations/posthog/events";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { facebookEvents } from "@/integrations/meta-pixel/client";

// Interface for the Checkout Session data
interface CheckoutSessionData {
  subscriptionType: string;
  planName: string;
  amount: number;
  trialEnd?: string; // ISO date string
  nextBillingDate: string; // ISO date string
  customerEmail: string;
}

export default function PaymentSuccessPage() {
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        // Get the session_id and type from the query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        const subscriptionType = urlParams.get("type");

        if (!sessionId || !subscriptionType) {
          throw new Error("Missing session_id or subscription type");
        }

        // Call the Supabase Edge Function to retrieve session details
        const {data, error} = await supabase.functions.invoke('get-checkout-session', {
          body: {sessionId}
        })
        // const response = await fetch(
        //     "https://your-supabase-url.functions.supabase.co/get-checkout-session",
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify({ sessionId }),
        //     }
        // );

        // const data = await response.json();

        if (error) {
          throw new Error(data.error);
        }

        setSessionData(data);

        // Track the successful subscription in analytics
        // if (subscriptionType === "monthly") {
        //   pricingEvents.selectPlan("premium");
        //   subscriptionEvents.subscriptionCompleted("monthly", 11.90);
        //   facebookEvents.completeRegistration("monthly", 11.90);
        // } else if (subscriptionType === "yearly") {
        //   pricingEvents.selectPlan("premium");
        //   subscriptionEvents.subscriptionCompleted("yearly", 9.90);
        //   facebookEvents.completeRegistration("yearly", 9.00);
        // }
      } catch (error) {
        toast({
          title: "Erreur lors de la récupération des détails de la session",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [toast]);

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
                    <p className="text-lg text-muted-foreground">
                      Chargement des détails de votre abonnement...
                    </p>
                ) : sessionData ? (
                    <div className="space-y-4">
                      <p className="text-lg text-muted-foreground">
                        Merci d’avoir souscrit au{" "}
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
                    </div>
                ) : (
                    <p className="text-lg text-muted-foreground">
                      Une erreur s’est produite lors de la récupération des détails de votre abonnement.
                    </p>
                )}
              </div>
              <div className="text-center">
                <Button asChild>
                  <Link to="/dashboard">Commencer à utiliser PedagoIA</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </>
  );
}