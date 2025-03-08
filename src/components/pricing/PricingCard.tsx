
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"
import { ReactNode } from "react"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

interface Feature {
  text: string
  tooltip?: string
}

interface PricingCardProps {
  title: string
  price: string
  period?: string
  yearlyPrice?: string
  features: (string | { text: string; tooltip: string })[]
  badge?: string
  badgeIcon?: React.ReactNode
  isPremium?: boolean
  onSubscribe?: () => void
  ctaText?: string
  CustomCTA?: ReactNode
  originalPrice?: string
}

export const PricingCard = ({
  title,
  price,
  period,
  yearlyPrice,
  features,
  badge,
  badgeIcon,
  isPremium,
  onSubscribe,
  ctaText,
  CustomCTA,
  originalPrice
}: PricingCardProps) => {
  return (
    <Card className={`p-8 relative ${
      isPremium 
        ? 'border-2 border-primary/20 shadow-xl hover:shadow-2xl' 
        : 'hover:shadow-xl'
    } transition-shadow duration-300 bg-white/90 backdrop-blur-sm`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className={isPremium 
            ? "bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-white"
            : "bg-secondary text-primary/90"
          }>
            {badgeIcon}
            {badge}
          </Badge>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          {originalPrice && (
            <span className="text-lg font-medium line-through text-muted-foreground">{originalPrice}</span>
          )}
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-2xl text-muted-foreground">{period}</span>}
        </div>
        {yearlyPrice && (
          <p className="text-sm text-primary mt-2 text-center">
            Soit {yearlyPrice}
          </p>
        )}
      </div>

      <div className="mt-8">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                {typeof feature === 'string' ? (
                  feature
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 cursor-help">
                        {feature.text}
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{feature.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {CustomCTA ? (
          CustomCTA
        ) : (
          <Button 
            onClick={onSubscribe} 
            className={`w-full ${
              isPremium 
                ? 'bg-gradient-to-r from-yellow-500 via-coral-500 to-pink-500 text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-md hover:shadow-lg'
            } text-lg py-6`}
            size="lg"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </Card>
  );
};
