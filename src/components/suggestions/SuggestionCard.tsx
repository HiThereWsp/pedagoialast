
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SuggestionCardProps {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  author: string;
  onVote: (id: string, voteType: 'up' | 'down') => Promise<void>;
  userVoteType?: 'up' | 'down';
  canVote: boolean;
  isAuthenticated: boolean;
  isOwnSuggestion: boolean;
}

export const SuggestionCard = ({
  id,
  title,
  description,
  votes,
  status,
  author,
  onVote,
  userVoteType,
  canVote,
  isAuthenticated,
  isOwnSuggestion
}: SuggestionCardProps) => {
  // Simplifier le prénom de l'auteur (si c'est une adresse email, prendre la partie avant @)
  const authorFirstName = author.includes('@') ? author.split('@')[0] : author;
  
  // Affichage du statut correct
  const displayStatus = status === 'créé' ? 'Demandée' : status === 'complété' ? 'Complétée' : status;
  
  const getUpvoteButtonClass = () => {
    if (!isAuthenticated) return "text-gray-300 cursor-not-allowed opacity-50";
    if (isOwnSuggestion) return "text-gray-300 cursor-not-allowed opacity-50";
    if (userVoteType === 'up') return "text-white bg-[#FF9633] hover:bg-[#FF9633]/90";
    return "text-gray-400 hover:text-[#FF9633] hover:bg-[#FF9633]/10";
  };

  const getDownvoteButtonClass = () => {
    if (!isAuthenticated) return "text-gray-300 cursor-not-allowed opacity-50";
    if (isOwnSuggestion) return "text-gray-300 cursor-not-allowed opacity-50";
    if (userVoteType === 'down') return "text-white bg-[#FF9633] hover:bg-[#FF9633]/90";
    return "text-gray-400 hover:text-[#FF9633] hover:bg-[#FF9633]/10";
  };

  const getUpvoteButtonTitle = () => {
    if (!isAuthenticated) return "Vous devez être connecté pour voter";
    if (isOwnSuggestion) return "Vous ne pouvez pas voter pour vos propres suggestions";
    if (userVoteType === 'up') return "Vous avez voté pour cette fonctionnalité";
    return "Voter positivement pour cette suggestion";
  };

  const getDownvoteButtonTitle = () => {
    if (!isAuthenticated) return "Vous devez être connecté pour voter";
    if (isOwnSuggestion) return "Vous ne pouvez pas voter pour vos propres suggestions";
    if (userVoteType === 'down') return "Vous avez voté contre cette fonctionnalité";
    return "Voter négativement pour cette suggestion";
  };

  const renderVoteIndicator = () => {
    if (!isAuthenticated || !userVoteType) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={`absolute -left-2 -top-2 z-10 px-2 py-1 ${
          userVoteType === 'up' 
            ? 'bg-[#FF9633]/20 text-[#FF9633] border-[#FF9633]' 
            : 'bg-gray-100 text-gray-600 border-gray-300'
        }`}
      >
        <Check className="w-3 h-3" />
      </Badge>
    );
  };
  
  return (
    <Card className={`p-4 bg-white shadow-sm rounded-lg transition-shadow hover:shadow-md relative ${
      id.includes('eval') ? 'border-l-4 border-[#B784A7]' : 
      id.includes('comm') ? 'border-l-4 border-[#77D1F3]' : 
      id.includes('report') ? 'border-l-4 border-[#9FD984]' : 
      id.includes('agenda') ? 'border-l-4 border-[#FF9EBC]' : 
      'border-l-4 border-[#FFEE7D]'
    }`}>
      {userVoteType && renderVoteIndicator()}
      
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={userVoteType === 'up' ? 'default' : 'ghost'}
                  size="sm" 
                  className={`p-1 rounded-full transition-all duration-200 ${getUpvoteButtonClass()}`} 
                  onClick={() => onVote(id, 'up')}
                  disabled={!canVote}
                  aria-label={getUpvoteButtonTitle()}
                  aria-pressed={userVoteType === 'up'}
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{getUpvoteButtonTitle()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="font-bold text-lg text-[#FF9633]">{votes}</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={userVoteType === 'down' ? 'default' : 'ghost'}
                  size="sm" 
                  className={`p-1 rounded-full transition-all duration-200 ${getDownvoteButtonClass()}`} 
                  onClick={() => onVote(id, 'down')}
                  disabled={!canVote}
                  aria-label={getDownvoteButtonTitle()}
                  aria-pressed={userVoteType === 'down'}
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{getDownvoteButtonTitle()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            {status === 'complété' && (
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {displayStatus}
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-3 leading-relaxed text-left">{description}</p>
          <div className="text-sm text-gray-400">
            <span>{authorFirstName}</span>
            {isOwnSuggestion && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Votre suggestion
              </span>
            )}
            {userVoteType && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`ml-2 text-xs ${
                      userVoteType === 'up' 
                        ? 'bg-[#FF9633]/10 text-[#FF9633]' 
                        : 'bg-gray-100 text-gray-600'
                    } px-2 py-0.5 rounded-full inline-flex items-center`}>
                      <Check className="w-3 h-3 mr-1" />
                      {userVoteType === 'up' ? 'Pour' : 'Contre'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{userVoteType === 'up' ? 'Vous avez voté pour cette fonctionnalité' : 'Vous avez voté contre cette fonctionnalité'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
