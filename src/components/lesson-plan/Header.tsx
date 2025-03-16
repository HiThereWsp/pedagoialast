
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-8">
      {!isMobile && (
        <img
          src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
          alt="PedagoIA Logo"
          className="w-[100px] h-[120px] object-contain mx-auto mb-4"
        />
      )}
    </div>
  );
}
