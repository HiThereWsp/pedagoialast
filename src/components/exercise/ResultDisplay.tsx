
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share2 } from "lucide-react";
import { AnimatedResultDisplay } from '@/components/shared/AnimatedResultDisplay';

interface ResultDisplayProps {
  exercises: string | null;
  onRegenerate?: () => void;
  onNewExercise?: () => void;
}

export function ResultDisplay({ exercises, onRegenerate, onNewExercise }: ResultDisplayProps) {
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        description: "Contenu copié dans le presse-papier",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du contenu",
      });
    }
  };

  const formatContent = (content: string) => {
    // Supprime les étoiles à la fin
    let formattedContent = content.replace(/\*\*\s*$/, '');
    
    // Améliore le formatage des sections
    const sections = formattedContent.split('FICHE PÉDAGOGIQUE');
    
    if (sections.length > 1) {
      const studentSection = sections[0].replace(/Fiche élève[\s:-]*/g, '');
      formattedContent = `<h2 class="text-xl font-bold mb-4 text-gray-900">Fiche élève</h2>\n\n${studentSection}<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900">FICHE PÉDAGOGIQUE</h2>${sections[1]}`;
    }

    return formattedContent
      .split('\n')
      .map(line => {
        if (line.match(/^Consigne:/i)) {
          return `<div class="bg-orange-50 p-4 rounded-lg my-4 border border-orange-200">
            <h3 class="text-lg font-semibold text-orange-700 mb-2">${line}</h3>
          </div>`;
        }
        if (line.match(/^[A-Z][\w\s]+:/)) {
          return `<h3 class="text-lg font-bold mt-6 mb-3 text-gray-900">${line}</h3>`;
        }
        if (line.match(/^\d+\./)) {
          return `<p class="ml-4 my-2 text-gray-800 font-medium">${line}</p>`;
        }
        if (line.trim().startsWith('-')) {
          return `<p class="ml-6 my-1 text-gray-700">${line}</p>`;
        }
        if (line.trim().length === 0) {
          return '<br/>';
        }
        return `<p class="my-2 text-gray-700">${line}</p>`;
      })
      .join('\n');
  };

  const actions = (
    <>
      <Button
        onClick={() => handleCopy(exercises)}
        variant="outline"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        {isCopied ? "Copié !" : "Partager"}
      </Button>
      {onRegenerate && (
        <Button
          onClick={onRegenerate}
          className="gap-2 bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 text-white"
        >
          <RefreshCw className="w-4 h-4" />
          Régénérer
        </Button>
      )}
      {onNewExercise && (
        <Button
          onClick={onNewExercise}
          variant="outline"
          className="gap-2"
        >
          Nouvel exercice
        </Button>
      )}
    </>
  );

  return (
    <AnimatedResultDisplay
      content={exercises}
      formatContent={formatContent}
      actions={actions}
      className="mt-4"
    />
  );
}
