
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SuggestionCardProps {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  author: string;
  onVote: (id: string, increment: boolean) => void;
  hasVoted: boolean;
  canVote: boolean;
}

export const SuggestionCard = ({
  id,
  title,
  description,
  votes,
  status,
  author,
  onVote,
  hasVoted,
  canVote
}: SuggestionCardProps) => {
  // Simplifier le prénom de l'auteur (si c'est une adresse email, prendre la partie avant @)
  const authorFirstName = author.includes('@') ? author.split('@')[0] : author;
  
  // Affichage du statut correct
  const displayStatus = status === 'créé' ? 'Demandée' : status === 'complété' ? 'Complétée' : status;
  
  return (
    <Card className={`p-4 bg-white shadow-sm rounded-lg transition-shadow hover:shadow-md ${
      id.includes('eval') ? 'border-l-4 border-[#B784A7]' : 
      id.includes('comm') ? 'border-l-4 border-[#77D1F3]' : 
      id.includes('report') ? 'border-l-4 border-[#9FD984]' : 
      id.includes('agenda') ? 'border-l-4 border-[#FF9EBC]' : 
      'border-l-4 border-[#FFEE7D]'
    }`}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-1 rounded-full ${
              hasVoted ? 'text-[#FF9633]' : 'text-gray-400'
            } hover:bg-[#FF9633]/10`} 
            onClick={() => onVote(id, true)}
            disabled={hasVoted || !canVote}
            title={hasVoted ? "Vous avez déjà voté pour cette suggestion" : 
                   !canVote ? "Vous avez atteint la limite de 3 votes" : 
                   "Voter pour cette suggestion"}
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <span className="font-bold text-lg text-[#FF9633]">{votes}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 rounded-full text-gray-400 hover:bg-[#FF9633]/10" 
            onClick={() => onVote(id, false)}
            disabled={!hasVoted}
            title={!hasVoted ? "Vous n'avez pas voté pour cette suggestion" : "Retirer votre vote"}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
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
          </div>
        </div>
      </div>
    </Card>
  );
};
