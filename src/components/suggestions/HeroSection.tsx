import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus } from 'lucide-react';

interface HeroSectionProps {
  onNewSuggestion: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({ onNewSuggestion, isAuthenticated }: HeroSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 shadow-sm border border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Vos idées</h1>
          </div>
          <p className="text-gray-600 max-w-md mb-4 md:mb-0 text-sm md:text-base">
            Proposez et votez pour les fonctionnalités qui vous intéressent. Nous prenons en compte vos suggestions pour améliorer PedagoIA.
          </p>
        </div>
        <Button 
          onClick={onNewSuggestion} 
          disabled={!isAuthenticated}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Proposer une idée
        </Button>
      </div>
      
      {!isAuthenticated && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          Vous devez être connecté pour proposer une nouvelle idée ou voter.
        </div>
      )}
    </div>
  );
};
