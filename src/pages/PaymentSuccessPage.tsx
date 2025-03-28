
import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckoutSession } from "@/hooks/payment/useCheckoutSession";
import { PaymentSuccessTracker } from "@/components/payment/PaymentSuccessTracker";
import { SessionDetailsCard } from "@/components/payment/SessionDetailsCard";

export default function PaymentSuccessPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get subscription type and client_id from URL params
  const urlParams = new URLSearchParams(location.search);
  const subscriptionType = urlParams.get("type") as "monthly" | "yearly" || "monthly";
  const clientId = urlParams.get("client_id") || undefined;
  const sessionId = urlParams.get("session_id") || undefined;
  
  // Fetch session details
  const { sessionData, loading } = useCheckoutSession(sessionId, subscriptionType);

  // Handle payment tracking
  useEffect(() => {
    if (sessionData) {
      // Display a confirmation toast
      toast({
        title: "Abonnement réussi !",
        description: "Votre compte a été activé avec succès.",
        duration: 5000,
      });
      
      // Navigate to /home after 5 seconds
      const timer = setTimeout(() => {
        navigate("/home");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [sessionData, toast, navigate]);

  return (
    <>
      <SEO
        title="Paiement réussi | PedagoIA - Bienvenue !"
        description="Votre abonnement a été créé avec succès. Commencez à utiliser PedagoIA dès maintenant !"
      />
      
      {/* Track payment success events */}
      <PaymentSuccessTracker 
        sessionData={sessionData} 
        subscriptionType={subscriptionType}
        clientId={clientId}
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
              
              <SessionDetailsCard 
                sessionData={sessionData}
                loading={loading}
              />
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
