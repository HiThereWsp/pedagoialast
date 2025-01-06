import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { ThumbsDown, Heart, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MagicParticles } from './MagicParticles';

interface ResultDisplayProps {
  exercises: string | null;
}

export function ResultDisplay({ exercises }: ResultDisplayProps) {
  const { toast } = useToast();
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showMagic, setShowMagic] = useState(false);

  useEffect(() => {
    if (exercises) {
      setShowMagic(true);
      const timer = setTimeout(() => setShowMagic(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [exercises]);

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
    <Card className="relative bg-white p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in overflow-hidden">
      <MagicParticles isActive={showMagic} />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Exercices générés
          </h2>
          <Sparkles 
            className={cn(
              "h-5 w-5 text-yellow-400",
              showMagic && "animate-pulse"
            )} 
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFeedback('like')}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-emerald-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === 1 && "text-emerald-500"
            )}
            aria-label="J'aime"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-red-500 transition-all duration-300 transform hover:scale-110",
              feedbackScore === -1 && "text-red-500"
            )}
            aria-label="Je n'aime pas"
          >
            <ThumbsDown className="h-5 w-5" />
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110",
              isCopied && "text-blue-500"
            )}
            aria-label="Copier les exercices"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className={cn(
        "prose prose-sm max-w-none transition-opacity duration-500",
        showMagic ? "opacity-100" : "opacity-90"
      )}>
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