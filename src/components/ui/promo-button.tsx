import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface PromoButtonProps {
  className?: string;
}

export function PromoButton({
  className
}: PromoButtonProps) {
  const navigate = useNavigate();

  const handlePromoClick = () => {
    navigate('/pricing');
  };

  return (
    <div className="relative">
      <button
        onClick={handlePromoClick}
        className={cn(
          "px-4 py-1.5 rounded-full bg-[#faf8f3] text-[#335c40] font-medium border border-gray-200",
          "shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all inline-flex items-center gap-1.5",
          "animate-pulse-subtle relative overflow-hidden",
          className
        )}
      >
        {/* Effet de brillance */}
        <span className="absolute -inset-x-10 h-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer-slow pointer-events-none"></span>
        
        <span>Prix de lancement <span className="ml-1">✨</span></span>
      </button>
    </div>
  );
} 