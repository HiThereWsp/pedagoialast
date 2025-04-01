
import { useEffect, useState } from "react";
import { pricingEvents } from "@/integrations/posthog/events";
import { SEO } from "@/components/SEO";
import { PricingFormDialog } from "@/components/pricing/PricingFormDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PricingForm from "@/components/pricing/PricingForm";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { FeatureHighlights } from "@/components/pricing/FeatureHighlights";
import { PricingPageTracking } from "@/components/pricing/PricingPageTracking";
import { SenjaTestimonialsSection } from "@/components/landing/SenjaTestimonialsSection";

const Pricing = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { isSubscribed, subscriptionType, isLoading } = useSubscription();
  
  useEffect(() => {
    // PostHog tracking
    pricingEvents.viewPricing();
    
    // Debug log
    console.log("Pricing page loaded", { 
      isSubscribed, 
      subscriptionType, 
      isLoading, 
      isDev: import.meta.env.DEV 
    });
  }, [isSubscribed, subscriptionType, isLoading]);

  const handleSchoolContactRequest = () => {
    setShowContactDialog(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black opacity-10 pointer-events-none"></div>
      <SEO 
        title="PedagoIA - Offres d'abonnement"
        description="Choisissez l'offre qui vous convient pour bénéficier des outils pédagogiques IA qui vous feront gagner du temps."
      />
      {/* Add the tracking component */}
      <PricingPageTracking />
      
      <main className="container mx-auto px-4 py-20 relative z-10">
        <PricingHeader />
        
        <PricingPlans 
          isSubscribed={isSubscribed}
          subscriptionType={subscriptionType}
          isLoading={isLoading}
          onSchoolContactRequest={handleSchoolContactRequest}
        />

        <FeatureHighlights />
        
        {/* Add the Senja testimonials section */}
        <SenjaTestimonialsSection />
      </main>

      {/* Dialog for school contact form */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Demande d'information pour établissement scolaire
            </DialogTitle>
          </DialogHeader>
          <PricingForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
