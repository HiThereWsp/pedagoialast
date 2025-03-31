
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SparklesText } from "@/components/ui/sparkles-text";
import { posthog } from '@/integrations/posthog/client';
import { ConfettiFireworks } from '@/components/ui/confetti-presets';
import { useSubscription } from '@/hooks/useSubscription';

export interface PremiumWelcomeDialogProps {
  firstName?: string;
}

export const PremiumWelcomeDialog: React.FC<PremiumWelcomeDialogProps> = ({ firstName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const { isSubscribed, subscriptionType } = useSubscription();
  
  // Function to check if user is seeing premium dialog for the first time
  const isFirstTimePremium = () => {
    const hasSeenDialog = localStorage.getItem('premium_welcome_shown');
    return !hasSeenDialog && isSubscribed;
  };
  
  // Trigger confetti when dialog opens
  const triggerConfetti = () => {
    if (!hasTriggeredConfetti) {
      // Trigger the confetti animation
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Confetti from left side
        window.confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        
        // Confetti from right side
        window.confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
      
      setHasTriggeredConfetti(true);
    }
  };
  
  // Handle dialog opening
  useEffect(() => {
    // Only show for premium users who haven't seen it yet
    if (isFirstTimePremium()) {
      // Short delay before showing dialog
      const timer = setTimeout(() => {
        setIsOpen(true);
        triggerConfetti();
        
        // Track the event in PostHog
        posthog.capture('premium_welcome_shown', {
          subscription_type: subscriptionType
        });
        
        // Mark as shown in localStorage
        localStorage.setItem('premium_welcome_shown', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, subscriptionType]);
  
  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
    
    // Track dialog closed event
    posthog.capture('premium_welcome_closed', {
      subscription_type: subscriptionType
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <SparklesText
              text={`Félicitations, ${firstName || "Professeur"} ! 🎉`}
              className="text-2xl font-bold mb-4"
              colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
            />
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            <p className="mb-3">
              Tu as choisi d'intégrer l'IA dans ton quotidien pour optimiser ta préparation de cours, et nous te remercions pour ta confiance.
            </p>
            <p className="mb-3">
              Nos utilisateurs gagnent en moyenne 30 heures par mois grâce à l'IA. Nous avons hâte de voir comment cet assistant pédagogique te sera utile.
            </p>
            <p className="font-medium mt-4">
              Bienvenue à bord ! 😎
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
            onClick={handleClose}
          >
            Explorer PedagoIA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
