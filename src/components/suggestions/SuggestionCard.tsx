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
  date: string;
  onVote: (id: string, increment: boolean) => void;
}

export const SuggestionCard = ({
  id,
  title,
  description,
  votes,
  status,
  author,
  date,
  onVote
}: SuggestionCardProps) => {
  return (
    <Card 
      className={`p-6 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 ${
        id.includes('eval') ? 'border-l-4 border-[#B784A7]' :
        id.includes('comm') ? 'border-l-4 border-[#77D1F3]' :
        id.includes('report') ? 'border-l-4 border-[#9FD984]' :
        id.includes('agenda') ? 'border-l-4 border-[#FF9EBC]' :
        'border-l-4 border-[#FFEE7D]'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
            onClick={() => onVote(id, true)}
          >
            <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
          <span className="font-bold text-lg text-[#FF9633]">{votes}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
            onClick={() => onVote(id, false)}
          >
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            {status === 'complété' && (
              <span className="px-4 py-1.5 text-xs font-medium bg-[#9FD984]/20 text-[#9FD984] rounded-full border border-[#9FD984]/30">
                Complété
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">{description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>{author}</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};