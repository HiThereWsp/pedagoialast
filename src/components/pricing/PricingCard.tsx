
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useCheckoutSession } from "@/hooks/useCheckoutSession"

interface PricingCardProps {
  title: string
  price: string
  period?: string
  features: string[]
  ctaText: string
  badge?: string
  originalPrice?: string
  isPremium?: boolean
  onSubscribe?: () => void
  disabled?: boolean
  priceId?: string
}

export const PricingCard = ({
  title,
  price,
  period,
  features,
  ctaText,
  badge,
  originalPrice,
  isPremium,
  onSubscribe,
  disabled,
  priceId
}: PricingCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createCheckoutSession } = useCheckoutSession();
  
  const handleSubscribe = async () => {
    if (disabled) return;
    
    // Si c'est pour le contact établissement scolaire, utiliser le callback directement
    if (title === "Établissement scolaire") {
      onSubscribe?.();
      return;
    }
    
    // Sinon, traiter l'abonnement via Stripe
    setIsLoading(true);
    
    try {
      if (priceId) {
        // Utiliser l'API Stripe via Edge Function
        const checkoutUrl = await createCheckoutSession(priceId);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      } else {
        // Fallback vers l'ancienne méthode si priceId n'est pas défini
        onSubscribe?.();
      }
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      toast.error("Une erreur est survenue lors du processus d'abonnement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "bg-secondary border-0",
        isPremium && "border-2 border-primary"
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>
          <div className="flex items-center flex-wrap">
            <span>{price}</span>
            {period && <span className="text-sm text-muted-foreground ml-1">{period}</span>}
            {originalPrice && (
              <span className="ml-2 text-sm line-through text-muted-foreground">
                {originalPrice}
              </span>
            )}
          </div>
          {badge && (
            <div className="mt-2">
              <Badge className="rounded-full font-normal">{badge}</Badge>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ul className="grid gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubscribe} disabled={disabled || isLoading}>
          {isLoading ? "Chargement..." : ctaText}
        </Button>
      </CardFooter>
    </Card>
  )
}
