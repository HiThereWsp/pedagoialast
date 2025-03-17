
import React from 'react';
import { BottomBar } from '@/components/mobile/BottomBar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface MobileContentProps {
  firstName: string;
  isLoading: boolean;
}

export const MobileContent = ({ firstName, isLoading }: MobileContentProps) => {
  return (
    <>
      {/* Header for mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4">
        <div className="flex-1 flex justify-center">
          <a href="/tableaudebord" className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-12 w-12" 
            />
          </a>
        </div>
      </div>
      
      {/* Mobile centered content with fixed positioning instead of absolute */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-6 z-30">
        {isLoading ? (
          <LoadingIndicator 
            message="Chargement en cours..." 
            type="dots"
            size="md"
          />
        ) : (
          <>
            <h1 className="text-5xl font-extrabold mb-4 text-gray-800 leading-tight tracking-tight text-balance">
              Bonjour {firstName || "Enseignant"} 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8">Sélectionnez un outil pour commencer</p>
          </>
        )}
      </div>
      
      {/* Bottom navigation bar for mobile */}
      <BottomBar firstName={firstName} />
    </>
  );
};
