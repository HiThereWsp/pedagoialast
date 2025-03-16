
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="text-center mb-8">
      <img
        src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
        alt="PedagoIA Logo"
        className={`${isMobile ? 'w-[80px] h-[100px]' : 'w-[100px] h-[120px]'} object-contain mx-auto mb-4`}
      />
      <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent`}>
        <span className="rotate-1 inline-block">Créateur</span> de plans de leçon
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
        Créez facilement des plans de leçon adaptés à vos besoins et objectifs d'apprentissage.
      </p>
    </div>
  );
};
