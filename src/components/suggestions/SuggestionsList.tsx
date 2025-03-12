
import React from 'react';
import { SuggestionCard } from './SuggestionCard';
import { Suggestion } from '@/hooks/suggestions/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  userVotes: Record<string, 'up' | 'down'>;
  onVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  isLoading: boolean;
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: (suggestionId: string) => boolean;
}

export const SuggestionsList = ({ 
  suggestions, 
  userVotes, 
  onVote, 
  isLoading,
  canVote,
  isAuthenticated,
  isOwnSuggestion
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

  const hasVoted = Object.keys(userVotes).length > 0;

  return (
    <div>
      {isAuthenticated && (
        <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={16} className="text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">Vous pouvez voter pour ou contre les suggestions, sauf les vôtres. Un badge indique les suggestions pour lesquelles vous avez déjà voté.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm text-gray-600 font-medium">Légende :</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-[#FF9633]/20 text-[#FF9633] border-[#FF9633]" />
              <span className="ml-2 text-gray-600">Vote positif</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300" />
              <span className="ml-2 text-gray-600">Vote négatif</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            {...suggestion}
            onVote={onVote}
            userVoteType={userVotes[suggestion.id]}
            canVote={canVote && !isOwnSuggestion(suggestion.id)}
            isAuthenticated={isAuthenticated}
            isOwnSuggestion={isOwnSuggestion(suggestion.id)}
          />
        ))}
      </div>
    </div>
  );
};
