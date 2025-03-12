
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeroSectionProps {
  onNewSuggestion: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({ onNewSuggestion, isAuthenticated }: HeroSectionProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight tracking-tight text-balance">
            Vos suggestions pour améliorer PedagoIA
          </h1>
          <p className="text-base text-gray-600">
            Partagez vos idées pour enrichir notre plateforme éducative.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Button 
              onClick={onNewSuggestion}
              className="w-full md:w-auto bg-[#FF9633] text-white hover:bg-[#FF9633]/90 transition-all duration-200 shadow-sm rounded-lg"
              disabled={!isAuthenticated}
              title={isAuthenticated ? "Proposer une nouvelle idée" : "Vous devez être connecté pour proposer une idée"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Proposer une idée
            </Button>
            
            {!isAuthenticated && (
              <p className="text-sm text-amber-600">
                Connectez-vous pour proposer et voter pour des idées.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
