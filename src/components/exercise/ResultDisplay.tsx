import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { ThumbsDown, Heart, Copy, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ResultDisplayProps {
  exercises: string | null;
}

export function ResultDisplay({ exercises }: ResultDisplayProps) {
  const { toast } = useToast();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!exercises) return null;

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1;
    setFeedbackScore(score);
    toast({
      description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exercises);
      setIsCopied(true);
      toast({
        description: "Exercices copiés dans le presse-papier",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie des exercices",
      });
    }
  };

  return (
    <Card className="relative bg-white p-6 rounded-xl border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      {/* Success Animation Container */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-xl animate-[pulse_3s_ease-in-out_infinite]" />
      
      {/* Success Icon and Message */}
      <div className="relative flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute w-16 h-16 bg-gradient-to-r from-[#F97316] to-[#D946EF] rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_1]" />
          <div className="absolute w-16 h-16 bg-gradient-to-r from-[#F97316] to-[#D946EF] rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-14 h-14 bg-white rounded-full">
            <Sparkles className="w-8 h-8 text-[#F97316] animate-[bounce_2s_infinite]" />
          </div>
        </div>
        <div className="flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-medium bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Exercices générés avec succès !
          </h3>
        </div>
      </div>

      <div className="relative flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent animate-fade-in">
          Exercices générés
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFeedback('like')}
            className={cn(
              "rounded p-2 text-gray-400 hover:bg-orange-50 hover:text-emerald-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === 1 && "text-emerald-500 scale-110"
            )}
            aria-label="J'aime"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={cn(
              "rounded p-2 text-gray-400 hover:bg-orange-50 hover:text-red-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === -1 && "text-red-500 scale-110"
            )}
            aria-label="Je n'aime pas"
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "rounded p-2 text-gray-400 hover:bg-orange-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110",
              isCopied && "text-blue-500 scale-110"
            )}
            aria-label="Copier les exercices"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none animate-fade-in">
        <ReactMarkdown
          components={{
            strong: ({ children }) => <span className="font-bold text-gray-900">{children}</span>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-800">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-800">{children}</h3>,
            p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-700">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-700">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
          }}
        >
          {exercises}
        </ReactMarkdown>
      </div>
    </Card>
  );
}