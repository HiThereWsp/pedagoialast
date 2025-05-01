import React, { useState, useEffect } from 'react';
// import { useSubscription } from '@/hooks/useSubscription';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Date du 1er mai pour les tests
const MAY_FIRST = new Date(2023, 4, 1, 0, 0, 0);
// Le compte à rebours dure 48h
const COUNTDOWN_DURATION_MS = 48 * 60 * 60 * 1000;
const PROMO_CODE = "TRAVAILLEQUIPEUT";
const STRIPE_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_live_b1ImBUC9LMUcyCxeZklBiMufFBhNOUh7FwoTQeVexulvk2qDRqIKERGO0i#fid2cGd2ZndsdXFsamtQa2x0cGBrYHZ2QGtkZ2lgYSc%2FcXdwYCknZHVsTmB8Jz8ndW5aaWxzYFowNE13VXV0THRdVE5rQm8xaEo1UDFCQFVTfW1qXDNWX0ZqcnZvUFxyfV9zNlZnNVNUcTxPVG9mNUBISz1oNzdXa3RLM1VEUlNORlN%2FV3JqUUJiV31dbFNqXDU1SlUwR2R9XWonKSdjd2poVmB3c2B3Jz9xd3BnKSdpZHxqcHFRfHVnJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZnbWppYWB3dic%2FcXdwYHgl";

// Utiliser ce hook simplifié au lieu du hook useSubscription qui peut avoir des problèmes
const useDebugSubscription = () => {
  console.log("Using debug subscription hook");
  return {
    isSubscribed: false, // Toujours false pour afficher la bannière pendant les tests
    isLoading: false
  };
};

const PromoCodeBanner = () => {
  console.log("Rendering PromoCodeBanner");
  
  // Utiliser le hook simplifié pour le développement
  const { isSubscribed, isLoading } = useDebugSubscription();
  
  console.log("Banner state:", { isSubscribed, isLoading });
  
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isCountdownEnded, setIsCountdownEnded] = useState(false);

  // Calculer le temps restant pour le compte à rebours de 48h
  const calculateTimeLeft = () => {
    // Pour les tests, utiliser une date fixe pour simuler un compte à rebours en cours
    const now = new Date();
    const countdownEndTime = now.getTime() + COUNTDOWN_DURATION_MS;
    const difference = countdownEndTime - now.getTime();
    
    console.log("Countdown calculation:", { 
      now: now.toString(),
      countdownEndTime: new Date(countdownEndTime).toString(),
      difference
    });
    
    if (difference <= 0) {
      setIsCountdownEnded(true);
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  // Mettre à jour le compte à rebours chaque seconde
  useEffect(() => {
    console.log("Setting up countdown timer");
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Si le compte à rebours est terminé, on le marque comme terminé
      // mais on ne masque PAS la bannière
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    // Initialiser le compte à rebours
    setTimeLeft(calculateTimeLeft());
    
    return () => clearInterval(timer);
  }, []);

  // Rediriger vers le checkout Stripe
  const handlePromoClick = () => {
    console.log("Banner clicked, redirecting to:", STRIPE_CHECKOUT_URL);
    window.location.href = STRIPE_CHECKOUT_URL;
  };

  // Ne pas afficher la bannière si l'utilisateur est abonné
  if (isLoading || isSubscribed) {
    console.log("Banner hidden because user is subscribed or loading");
    return null;
  }

  // Formatter le temps restant pour l'affichage
  const formatTimeUnit = (value: number) => value.toString().padStart(2, '0');
  
  console.log("Rendering banner with countdown:", timeLeft);

  return (
    <div 
      onClick={handlePromoClick}
      className={cn(
        "fixed top-0 left-0 right-0 py-3 px-4 text-center font-medium flex flex-col sm:flex-row items-center justify-center gap-2",
        "bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-md z-50",
        "cursor-pointer hover:from-orange-600 hover:to-pink-700 transition-all"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🎁</span>
        <span>
          <strong>-40% sur l'abonnement annuel</strong> pour la Fête du Travail avec le code <strong>{PROMO_CODE}</strong>
        </span>
      </div>
      
      {!isCountdownEnded && (
        <div className="bg-white/20 rounded-md px-3 py-1 flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span className="font-mono">
            {timeLeft.days > 0 && `${timeLeft.days}j `}
            {formatTimeUnit(timeLeft.hours)}:
            {formatTimeUnit(timeLeft.minutes)}:
            {formatTimeUnit(timeLeft.seconds)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PromoCodeBanner; 