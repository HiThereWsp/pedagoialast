
import React from 'react';
import { SuggestionCard } from './SuggestionCard';
import { Suggestion } from '@/hooks/suggestions/types';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  userVotes: string[];
  onVote: (id: string, increment: boolean) => Promise<void>;
  isLoading: boolean;
  canVote: boolean;
}

export const SuggestionsList = ({ 
  suggestions, 
  userVotes, 
  onVote, 
  isLoading,
  canVote
}: SuggestionsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Chargement des suggestions...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Aucune suggestion trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          {...suggestion}
          onVote={onVote}
          hasVoted={userVotes.includes(suggestion.id)}
          canVote={canVote}
        />
      ))}
    </div>
  );
};
