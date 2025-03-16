
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText: string;
  onSubscribe: () => void;
  badge?: string;
  isPremium?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PricingCard({
  title,
  price,
  originalPrice,
  period = "",
  description,
  features,
  ctaText,
  onSubscribe,
  badge,
  isPremium = false,
  disabled = false,
  isLoading = false
}: PricingCardProps) {
  return (
    <Card className={cn(
      "flex flex-col border shadow-sm hover:shadow transition-all duration-200",
      isPremium && "border-primary/50 shadow-primary/10"
    )}>
      <CardHeader className={cn(
        "pb-8",
        isPremium && "bg-primary/5"
      )}>
        <div className="space-y-2">
          {badge && (
            <Badge variant={isPremium ? "default" : "secondary"} className="mb-2">
              {badge}
            </Badge>
          )}
          <h3 className="text-2xl font-bold leading-none">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-3xl font-bold">{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              {originalPrice}
            </span>
          )}
          {period && <span className="text-sm text-muted-foreground">{period}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={onSubscribe} 
          className={cn(
            "w-full", 
            isPremium ? "bg-primary hover:bg-primary/90" : ""
          )}
          disabled={disabled || isLoading}
          variant={isPremium ? "default" : "outline"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            ctaText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
