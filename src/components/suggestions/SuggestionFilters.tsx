
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SuggestionFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: string) => void;
}

export const SuggestionFilters = ({
  searchTerm,
  selectedStatus,
  onSearchChange,
  onStatusChange
}: SuggestionFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Structure révisée pour éviter les chevauchements */}
      <div className="flex flex-col gap-4">
        {/* Filtres de statut en premier pour être toujours visibles */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => onStatusChange('tous')}
            className={`rounded-lg ${selectedStatus === 'tous' ? 'bg-[#FF9633]/10 text-[#FF9633]' : 'text-gray-500'}`}
            size="sm"
          >
            Toutes
          </Button>
          <Button
            variant="ghost"
            onClick={() => onStatusChange('créé')}
            className={`rounded-lg ${selectedStatus === 'créé' ? 'bg-[#FF9633]/10 text-[#FF9633]' : 'text-gray-500'}`}
            size="sm"
          >
            En cours
          </Button>
          <Button
            variant="ghost"
            onClick={() => onStatusChange('complété')}
            className={`rounded-lg ${selectedStatus === 'complété' ? 'bg-[#FF9633]/10 text-[#FF9633]' : 'text-gray-500'}`}
            size="sm"
          >
            Complétées
          </Button>
        </div>
        
        {/* Champ de recherche en dessous des filtres */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une suggestion..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border rounded-lg focus:ring-1 focus:ring-[#FF9633] focus:border-[#FF9633]"
          />
        </div>
      </div>
    </div>
  );
};
