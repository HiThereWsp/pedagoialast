
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { pricingEvents } from "@/integrations/posthog/events";

interface PromoCodeSectionProps {
  autoPromoCode: string | null;
  currentPromoCode: string | null;
  setCurrentPromoCode: (code: string | null) => void;
}

export const PromoCodeSection = ({ 
  autoPromoCode, 
  currentPromoCode, 
  setCurrentPromoCode 
}: PromoCodeSectionProps) => {
  const [manualPromoCode, setManualPromoCode] = useState("");

  useEffect(() => {
    // Si un code promo est détecté automatiquement, l'utiliser par défaut
    if (autoPromoCode) {
      setCurrentPromoCode(autoPromoCode);
    }
  }, [autoPromoCode, setCurrentPromoCode]);

  const applyPromoCode = () => {
    if (manualPromoCode.trim()) {
      setCurrentPromoCode(manualPromoCode.trim().toUpperCase());
      toast.success(`Code promo "${manualPromoCode.trim().toUpperCase()}" appliqué!`);
      
      // Tracking
      try {
        pricingEvents.applyPromoCode(manualPromoCode.trim().toUpperCase());
      } catch (e) {
        console.error("Erreur lors du tracking du code promo:", e);
      }
    }
  };

  return (
    <div className="mt-8 max-w-xs mx-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {currentPromoCode ? `Code promo: ${currentPromoCode}` : "Ajouter un code promo"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h3 className="font-medium text-center">Code Promo</h3>
            <div className="flex space-x-2">
              <Input 
                placeholder="Entrez votre code" 
                value={manualPromoCode}
                onChange={(e) => setManualPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={applyPromoCode}>Appliquer</Button>
            </div>
            {currentPromoCode && (
              <p className="text-xs text-muted-foreground text-center">
                Code promo actif: <span className="font-semibold text-primary">{currentPromoCode}</span>
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
