
import React, { useEffect } from 'react';
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
  ctaAction
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
}) => (
  <Card className={`p-6 relative ${popular ? 'border-2 border-primary shadow-premium' : ''}`}>
    {popular && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
        Offre de lancement -50%
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
  const handleMonthlySubscription = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'monthly',
      location: 'landing_page'
    });
  };

  const handleYearlySubscription = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'yearly',
      location: 'landing_page'
    });
  };

  const handleEnterprisePlan = () => {
    posthog.capture('pricing_plan_selected', {
      plan: 'enterprise',
      location: 'landing_page'
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Des tarifs adaptés à vos besoins
          </h2>
          <p className="text-xl text-muted-foreground">
            Commencez gratuitement et changez de plan à tout moment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            title="Plan mensuel"
            description="Pour découvrir tous les outils de PedagoIA"
            price="11,90€"
            features={[
              "Accès illimité à l'assistant pédagogique via le chat",
              "Accéder à plus de 10 outils IA pédagogiques",
              "Sauvegarde de tous vos supports de cours générés",
              "Utilisation illimitée de tous les outils",
              "+14h économisées /semaine"
            ]}
            ctaText="Commencer l'essai gratuit"
            ctaAction={handleMonthlySubscription}
          />

          <PricingCard
            title="Plan annuel"
            description="La meilleure offre pour optimiser votre temps"
            price="9€"
            period="/mois"
            badge="3 mois gratuits offerts"
            features={[
              "Tous les avantages du plan mensuel",
              "Vote prioritaire pour de nouvelles fonctionnalités",
              "Recevez les mises à jour à l'avance",
              "Accès à la communauté privée d'enseignants 3.0"
            ]}
            popular
            ctaText="Profiter de -50%"
            ctaAction={handleYearlySubscription}
          />

          <PricingCard
            title="École"
            description="Une solution sur mesure pour votre établissement"
            price="Sur mesure"
            features={[
              "Tout ce qui est inclus dans le plan annuel et bien plus",
              "Créez des outils sur mesure",
              "Tableau de suivi pour la direction",
              "Des outils adaptés à votre projet pédagogique",
              "Un canal support dédié"
            ]}
            ctaText="Nous contacter"
            ctaAction={handleEnterprisePlan}
          />
        </div>
      </div>
    </section>
  );
};
