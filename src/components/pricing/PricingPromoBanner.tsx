import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const PricingPromoBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Compte à rebours de 48h depuis maintenant
  useEffect(() => {
    const endTime = new Date().getTime() + (48 * 60 * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
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
    const timer = setInterval(() => {
      setTimeLeft(updateTimer());
    }, 1000);
    
    // Initialiser le compteur
    setTimeLeft(updateTimer());
    
    return () => clearInterval(timer);
  }, []);
  
  // Formatter le temps restant pour l'affichage
  const formatTimeUnit = (value: number) => value.toString().padStart(2, '0');
  
  return (
    <div className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white p-4 mb-8 relative overflow-hidden shadow-lg">
      {/* Effet de brillance */}
      <span className="absolute -inset-x-40 h-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer-slow pointer-events-none"></span>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <div className="flex items-center">
          <span className="text-xl mr-2">🎁</span>
          <span className="font-medium">
            <span className="font-bold">Prix de lancement</span> • Profitez de 4 mois offerts avec l'abonnement annuel
          </span>
        </div>
        
        <div className="flex items-center bg-white/20 rounded-md px-3 py-1 gap-2">
          <Calendar className="h-5 w-5" />
          <span className="font-mono">
            Offre valable pendant {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
            {formatTimeUnit(timeLeft.hours)}h
            {formatTimeUnit(timeLeft.minutes)}m
            {formatTimeUnit(timeLeft.seconds)}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingPromoBanner; 