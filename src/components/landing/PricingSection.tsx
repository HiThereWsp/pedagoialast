import React from 'react';
import { PricingCard } from './pricing/PricingCard';
import { usePromoCode } from './pricing/usePromoCode';
import { usePricingAnalytics } from './pricing/usePricingAnalytics';
import { handleSubscription } from '@/utils/subscription';

export const PricingSection = () => {
  const promoCode = usePromoCode();
  const { trackPlanSelection } = usePricingAnalytics(promoCode);

  const handleFreePlan = () => {
    trackPlanSelection('free', 'free_plan');
    console.log('Free plan selected');
  };

  const handlePremiumPlan = () => {
    trackPlanSelection('premium', 'prod_Rvu5l79HX8EAis');
    console.log('Premium plan selected');
    handleSubscription('monthly');
  };

  const handleEnterprisePlan = () => {
    trackPlanSelection('enterprise', 'prod_Rvu5hv7FxnkHpv');
    console.log('Enterprise plan selected');
    handleSubscription('yearly');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Des tarifs simples et transparents
          </h2>
          <p className="text-xl text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins. Changez ou annulez à tout moment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            title="Plan Gratuit"
            description="Pour découvrir les outils de base de Pédagoia"
            price="0€"
            features={[
              'Accès à 20 outils',
              'Utilisation quotidienne limitée',
              'Sauvegarde limitée des travaux',
              'Accès à la communauté d\'enseignants',
              'Chat avec Élia (limité)'
            ]}
            ctaText="Commencer gratuitement"
            ctaAction={handleFreePlan}
          />

          <PricingCard
            title="Plan Premium"
            description="Pour maximiser votre productivité"
            price="8,99€"
            yearlyPrice="74,99€"
            features={[
              'Accès à plus de 50 outils',
              'Usage illimité',
              'Sauvegarde illimitée des travaux',
              'Accès à la communauté d\'enseignants Pedagoia',
              'Accès illimité au chat libre avec Élia',
              '+10 heures gagnées par semaine',
              'Accès prioritaire aux nouvelles fonctionnalités',
              'Service client prioritaire'
            ]}
            popular
            ctaText="Débloquez l'accès illimité"
            ctaAction={handlePremiumPlan}
            promoCode={promoCode || undefined}
          />

          <PricingCard
            title="Plan Établissement"
            description="Pour les écoles et institutions"
            price="Sur mesure"
            period=""
            features={[
              'Tout du plan Premium',
              'Déploiement personnalisé',
              'Formation des équipes',
              'Support dédié 24/7',
              'Intégration avec vos outils',
              'Tableau de bord administrateur',
              'Rapports détaillés',
              'SLA garanti'
            ]}
            ctaText="Contactez-nous"
            ctaAction={handleEnterprisePlan}
          />
        </div>
      </div>
    </section>
  );
};
