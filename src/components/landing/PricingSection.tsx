
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { posthog } from '@/integrations/posthog/client';

const PricingCard = ({ 
  title, 
  description, 
  price, 
  period = "/mois",
  yearlyPrice,
  features,
  popular,
  ctaText,
  ctaAction,
  promoCode
}: {
  title: string;
  description: string;
  price: string;
  period?: string;
  yearlyPrice?: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaAction: () => void;
  promoCode?: string;
}) => (
  <Card className={`p-6 relative ${popular ? 'border-2 border-primary shadow-premium' : ''}`}>
    {popular && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
        Le plus populaire
      </Badge>
    )}
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6">{description}</p>
    <div className="mb-6">
      <span className="text-4xl font-bold">{price}</span>
      <span className="text-muted-foreground">{period}</span>
      {yearlyPrice && (
        <p className="text-sm text-muted-foreground mt-1">
          ou {yearlyPrice} /an (économisez 17%)
        </p>
      )}
      {promoCode && (
        <div className="mt-2 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1 rounded-md text-sm">
          Code promo: <span className="font-bold">{promoCode}</span>
        </div>
      )}
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
          <Check className="w-5 h-5 text-primary mt-0.5" />
          <span className="text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      onClick={ctaAction}
      className={`w-full ${
        popular 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
      }`}
    >
      {ctaText}
    </Button>
  </Card>
);

export const PricingSection = () => {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  
  // Check localStorage for referral info to set promo code
  useEffect(() => {
    const refSource = localStorage.getItem('pedago_ref');
    
    if (refSource) {
      // Generate promo code based on referral source
      if (refSource.includes('maitreClement')) {
        setPromoCode('CLEMENT25');
      } else if (refSource.includes('lollieUnicorn')) {
        setPromoCode('LOLLIE25');
      } else if (refSource.includes('laprof40')) {
        setPromoCode('PROF40-25');
      } else if (refSource.includes('mehdush')) {
        setPromoCode('MEHDUSH25');
      } else if (refSource.includes('sylvie')) {
        setPromoCode('SYLVIE25');
      } else if (refSource.includes('fb')) {
        setPromoCode('FB25');
      } else if (refSource.includes('tt')) {
        setPromoCode('TT25');
      } else if (refSource.startsWith('t20/') || refSource.startsWith('t40/')) {
        setPromoCode('TIKTOK25');
      } else if (refSource.startsWith('i20/') || refSource.startsWith('i40/')) {
        setPromoCode('INSTA25');
      }
      
      // Track promo code generation
      if (promoCode) {
        posthog.capture('promo_code_generated', {
          promo_code: promoCode,
          ref_source: refSource,
          redirect_id: localStorage.getItem('pedago_redirect_id')
        });
      }
    }
  }, []);

  const handleFreePlan = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'free',
      location: 'pricing_page',
      promo_code_displayed: promoCode
    })
    console.log('Free plan selected');
  };

  const handlePremiumPlan = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'premium',
      location: 'pricing_page',
      promo_code_displayed: promoCode,
      ref_source: localStorage.getItem('pedago_ref')
    })
    console.log('Premium plan selected');
  };

  const handleEnterprisePlan = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'enterprise',
      location: 'pricing_page',
      promo_code_displayed: promoCode
    })
    console.log('Enterprise plan selected');
  };

  // Track pricing page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.capture('pricing_page_viewed', {
        ref_source: localStorage.getItem('pedago_ref'),
        promo_code_displayed: promoCode
      })
    }
  }, [promoCode])

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
