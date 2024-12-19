import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Suggestion } from "@/types/suggestion"

interface SuggestionCardProps {
  suggestion: Suggestion;
  onVote: (id: string, increment: boolean) => void;
}

export const SuggestionCard = ({ suggestion, onVote }: SuggestionCardProps) => {
  return (
    <Card 
      className={`p-6 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 ${
        suggestion.id.includes('eval') ? 'border-l-4 border-[#B784A7]' :
        suggestion.id.includes('comm') ? 'border-l-4 border-[#77D1F3]' :
        suggestion.id.includes('report') ? 'border-l-4 border-[#9FD984]' :
        suggestion.id.includes('agenda') ? 'border-l-4 border-[#FF9EBC]' :
        'border-l-4 border-[#FFEE7D]'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
            onClick={() => onVote(suggestion.id, true)}
          >
            <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
          <span className="font-bold text-lg text-[#FF9633]">{suggestion.votes}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className="px-2 hover:text-[#FF9633] hover:bg-[#FF9633]/10 transition-all duration-200 rounded-xl group"
            onClick={() => onVote(suggestion.id, false)}
          >
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-800">{suggestion.title}</h3>
            {suggestion.status === 'complété' && (
              <span className="px-4 py-1.5 text-xs font-medium bg-[#9FD984]/20 text-[#9FD984] rounded-full border border-[#9FD984]/30">
                Complété
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">{suggestion.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>{suggestion.author}</span>
            <span>{suggestion.date}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}