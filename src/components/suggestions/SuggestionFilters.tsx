
import React from 'react';
import { Button } from '@/components/ui/button';

interface SuggestionFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const SuggestionFilters = ({
  selectedStatus,
  onStatusChange
}: SuggestionFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
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
          Demandées
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
    </div>
  );
};
