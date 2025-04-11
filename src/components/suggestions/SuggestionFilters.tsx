import React from 'react';
import { Clock, Check, Filter, MessageCircle } from 'lucide-react';

interface SuggestionFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  { id: 'tous', label: 'Toutes', icon: <Filter size={16} />, color: 'bg-gray-100 text-gray-800' },
  { id: 'créé', label: 'Demandées', icon: <Clock size={16} />, color: 'bg-blue-100 text-blue-800' },
  { id: 'en_cours', label: 'En cours', icon: <MessageCircle size={16} />, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'complété', label: 'Complétées', icon: <Check size={16} />, color: 'bg-green-100 text-green-800' }
];

export const SuggestionFilters = ({
  selectedStatus,
  onStatusChange
}: SuggestionFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrer par statut</h3>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => onStatusChange(option.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${selectedStatus === option.id 
                ? `${option.color} border border-${option.id === 'tous' ? 'gray' : option.color.split(' ')[0].replace('bg-', '')}-200` 
                : 'text-gray-500 hover:bg-gray-100 border border-transparent'}
            `}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
