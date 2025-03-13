
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  originalPrice?: string;
  features: string[];
  ctaText: string;
  onSubscribe: () => void;
  isPremium?: boolean;
  badge?: string;
  disabled?: boolean;
}

export const PricingCard = ({
  title,
  price,
  period = "",
  originalPrice,
  features,
  ctaText,
  onSubscribe,
  isPremium = false,
  badge,
  disabled = false
}: PricingCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden shadow-lg p-8 flex flex-col justify-between transform transition-all duration-200 hover:scale-105 ${
        isPremium ? "border-2 border-primary shadow-xl" : ""
      }`}
    >
      {badge && (
        <Badge className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold border-none">
          {badge}
        </Badge>
      )}
      
      <div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground ml-1">{period}</span>}
          
          {originalPrice && (
            <div className="mt-1">
              <span className="text-muted-foreground line-through text-sm">
                {originalPrice}
              </span>
            </div>
          )}
        </div>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <Button
        onClick={onSubscribe}
        disabled={disabled}
        className={`w-full transition-all duration-300 ${
          isPremium
            ? "bg-gradient-to-r from-[#9E7AFF] via-[#8B5CF6] to-[#D946EF] text-white hover:shadow-xl hover:shadow-primary/20"
            : "bg-secondary hover:bg-secondary/90"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {ctaText}
      </Button>
    </Card>
  );
};
