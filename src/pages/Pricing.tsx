
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
import { usePromoCode } from "@/components/landing/pricing/usePromoCode";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PromoCodeSection } from "@/components/pricing/PromoCodeSection";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { FeatureHighlights } from "@/components/pricing/FeatureHighlights";

const Pricing = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { isSubscribed, subscriptionType, isLoading } = useSubscription();
  const autoPromoCode = usePromoCode();
  
  // Combiner le code promo automatique et manuel
  const [currentPromoCode, setCurrentPromoCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Tracking PostHog
    pricingEvents.viewPricing();
  }, []);

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
      <main className="container mx-auto px-4 py-20 relative z-10">
        <PricingHeader />
        
        <PromoCodeSection 
          autoPromoCode={autoPromoCode} 
          currentPromoCode={currentPromoCode}
          setCurrentPromoCode={setCurrentPromoCode}
        />
        
        <PricingPlans 
          currentPromoCode={currentPromoCode}
          isSubscribed={isSubscribed}
          subscriptionType={subscriptionType}
          isLoading={isLoading}
          onSchoolContactRequest={handleSchoolContactRequest}
        />

        <FeatureHighlights />
      </main>

      {/* Dialog pour le formulaire de contact établissement */}
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
