
import React from 'react';
import { Button } from '@/components/ui/button';

interface SortButtonsProps {
  sortBy: 'votes' | 'recent';
  onSortChange: (sort: 'votes' | 'recent') => void;
}

export const SortButtons = ({ sortBy, onSortChange }: SortButtonsProps) => {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <Button
        variant="ghost"
        onClick={() => onSortChange('votes')}
        className={`rounded-lg ${sortBy === 'votes' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
      >
        Plus votées
      </Button>
      <Button
        variant="ghost"
        onClick={() => onSortChange('recent')}
        className={`rounded-lg ${sortBy === 'recent' ? 'text-[#FF9633] bg-[#FF9633]/10' : ''}`}
      >
        Plus récentes
      </Button>
    </div>
  );
};
