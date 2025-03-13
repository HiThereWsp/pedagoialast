
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface PricingCardProps { 
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
}

export const PricingCard = ({ 
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
}: PricingCardProps) => (
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
