
import { PricingCard } from "@/components/pricing/PricingCard";
import { pricingEvents } from "@/integrations/posthog/events";
import { subscriptionEvents } from "@/integrations/posthog/events";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { handleSubscription } from "@/utils/subscription";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlansProps {
  currentPromoCode: string | null;
  isSubscribed: boolean;
  subscriptionType: string | null;
  isLoading: boolean;
  onSchoolContactRequest: () => void;
}

export const PricingPlans = ({
  currentPromoCode,
  isSubscribed,
  subscriptionType,
  isLoading,
  onSchoolContactRequest
}: PricingPlansProps) => {
  // Vérifier si l'utilisateur est connecté
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Veuillez vous connecter pour souscrire à un abonnement");
      window.location.href = '/login?redirect=/pricing';
      return false;
    }
    
    return true;
  };

  const handleMonthlySubscription = async () => {
    if (!await checkAuth()) return;
    
    // Tracking PostHog
    pricingEvents.selectPlan('premium');
    subscriptionEvents.subscriptionStarted('monthly', 11.90);
    
    // Tracking Facebook
    facebookEvents.initiateCheckout('monthly', 11.90);
    
    // Utiliser le code promo s'il existe
    handleSubscription('monthly', currentPromoCode);
  };

  const handleYearlySubscription = async () => {
    if (!await checkAuth()) return;
    
    // Tracking PostHog
    pricingEvents.selectPlan('premium');
    subscriptionEvents.subscriptionStarted('yearly', 9.90);
    
    // Tracking Facebook
    facebookEvents.initiateCheckout('yearly', 9.00);
    
    // Utiliser le code promo s'il existe
    handleSubscription('yearly', currentPromoCode);
  };

  // Texte du bouton selon l'état de l'abonnement
  const getButtonText = (planType) => {
    if (isLoading) return "Chargement...";
    
    if (isSubscribed) {
      if (subscriptionType === planType || 
         (subscriptionType === 'yearly' && planType === 'monthly')) {
        return "Votre abonnement actuel";
      }
      return planType === 'yearly' ? "Passer à l'annuel" : "Changer de formule";
    }
    
    return "Démarrer l'essai gratuit";
  };

  // Modification: Ne pas désactiver les boutons en mode dev pour des tests
  const isButtonDisabled = (planType) => {
    // En environnement de développement, permettre toujours les clics
    if (import.meta.env.DEV) {
      return false;
    }
    
    // En production, utiliser la logique standard
    return isSubscribed && subscriptionType === planType;
  };

  return (
    <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
      <PricingCard
        title="Plan mensuel"
        price="11,90€"
        period="/mois"
        features={[
          "Accédez à l'assistant pédagogique via le chat sans limite",
          "Utilisez plus de 10 outils pédagogiques",
          "Sauvegardez tous vos supports de cours générés",
          "Exploitez tous les outils sans limitation",
          "Économisez plus de 14h par semaine grâce aux outils IA"
        ]}
        ctaText={getButtonText('monthly')}
        onSubscribe={handleMonthlySubscription}
        disabled={isButtonDisabled('monthly')}
      />
      <PricingCard
        title="Plan annuel"
        price="119€"
        originalPrice="142,80€"
        badge="2 mois offerts"
        isPremium
        features={[
          "Bénéficiez de tous les avantages du plan mensuel",
          "Votez pour de nouveaux outils tous les mois",
          "Recevez les mises à jour en avant-première",
          "Accédez à la communauté privée d'enseignants 3.0"
        ]}
        ctaText={getButtonText('yearly')}
        onSubscribe={handleYearlySubscription}
        disabled={isButtonDisabled('yearly')}
      />
      <PricingCard
        title="Établissement scolaire"
        price="Sur mesure"
        features={[
          "Bénéficiez de tout ce qui est inclus dans le plan annuel",
          "Créez des outils personnalisés pour votre établissement",
          "Accédez au tableau de suivi pour la direction",
          "Adaptez les outils à votre projet d'établissement"
        ]}
        ctaText="Prendre contact"
        onSubscribe={onSchoolContactRequest}
      />
    </div>
  );
};
