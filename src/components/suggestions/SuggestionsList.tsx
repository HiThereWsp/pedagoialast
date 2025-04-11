import React from 'react';
import { Suggestion, Comment } from '@/hooks/suggestions/types';
import { ChevronUp, MessageCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  userVotes: Record<string, 'up' | 'down'>;
  comments: Record<string, Comment[]>;
  onVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  onComment?: (suggestionId: string, text: string) => Promise<Comment | null>;
  isLoading: boolean;
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: (suggestionId: string) => boolean;
}

export const SuggestionsList = ({ 
  suggestions, 
  userVotes, 
  comments,
  onVote, 
  onComment,
  isLoading,
  canVote,
  isAuthenticated,
  isOwnSuggestion
}: SuggestionsListProps) => {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 p-6">
        <p className="text-gray-500">Aucune suggestion trouvée</p>
      </div>
    );
  }

  const getBackgroundColor = (index: number) => {
    // Alternance de couleurs pastels très subtiles pour les cartes
    const colors = [
      'bg-white',
      'bg-sky-50',
      'bg-indigo-50',
      'bg-purple-50',
      'bg-rose-50'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => {
        const userVoteType = userVotes[suggestion.id];
        const isVoted = userVoteType === 'up';
        const suggestionComments = comments[suggestion.id] || [];
        const commentCount = suggestionComments.length;
        
        return (
          <Card 
            key={suggestion.id} 
            className={`hover:shadow-md transition-shadow border-l-4 ${
              suggestion.status === 'complété' ? 'border-l-green-400' : 
              suggestion.status === 'en_cours' ? 'border-l-amber-400' : 
              'border-l-indigo-400'
            } ${getBackgroundColor(index)}`}
          >
            <div className="p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 rounded-full ${
                      isVoted 
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={() => canVote && onVote(suggestion.id, 'up')}
                    disabled={!canVote}
                    title={
                      !isAuthenticated ? "Vous devez être connecté pour voter" : 
                      isOwnSuggestion(suggestion.id) ? "Vous ne pouvez pas voter pour vos propres suggestions" :
                      isVoted ? "Retirer votre vote" : "Voter pour cette suggestion"
                    }
                  >
                    <ChevronUp className={`h-5 w-5 ${isVoted ? 'text-indigo-700' : 'text-gray-500'}`} />
                    <span className={`font-semibold ${isVoted ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {suggestion.votes || 0}
                    </span>
                  </Button>
                </div>
                
                <p className="text-gray-600">{suggestion.description.length > 120 
                  ? `${suggestion.description.substring(0, 120)}...` 
                  : suggestion.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                      {suggestion.tool_name || 'Fonctionnalité'}
                    </Badge>
                    
                    {suggestion.status === 'en_cours' && (
                      <Badge className="bg-amber-100 text-amber-700 border-none">
                        En cours
                      </Badge>
                    )}
                    
                    {suggestion.status === 'complété' && (
                      <Badge className="bg-green-100 text-green-700 border-none">
                        Complétée
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                      onClick={() => {
                        window.location.href = `/suggestion/${suggestion.id}`;
                      }}
                      title={commentCount > 0 ? `Voir les ${commentCount} commentaires` : "Ajouter un commentaire"}
                    >
                      <div className="relative">
                        <MessageCircle 
                          className={`h-5 w-5 ${commentCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`} 
                        />
                        {commentCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {commentCount}
                          </span>
                        )}
                      </div>
                    </Button>
                    
                    {suggestion.is_premium && (
                      <Badge className="bg-rose-100 text-rose-700 flex items-center gap-1 px-2 border-none">
                        <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                        <span className="text-xs">Premium</span>
                      </Badge>
                    )}
                    
                    {isOwnSuggestion(suggestion.id) && (
                      <Badge className="bg-sky-100 text-sky-700 text-xs border-none">
                        Votre suggestion
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
