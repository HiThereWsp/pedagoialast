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
    <div className="flex gap-4 flex-col md:flex-row bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg border border-[#FF9633]/10">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une suggestion..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-2 focus:border-[#FF9633] transition-all duration-200 bg-white rounded-xl"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onStatusChange('tous')}
          className={`rounded-xl ${selectedStatus === 'tous' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
        >
          Toutes
        </Button>
        <Button
          variant="outline"
          onClick={() => onStatusChange('créé')}
          className={`rounded-xl ${selectedStatus === 'créé' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
        >
          En cours
        </Button>
        <Button
          variant="outline"
          onClick={() => onStatusChange('complété')}
          className={`rounded-xl ${selectedStatus === 'complété' ? 'bg-[#FF9633]/10 border-[#FF9633] text-[#FF9633]' : ''}`}
        >
          Complétées
        </Button>
      </div>
    </div>
  );
};