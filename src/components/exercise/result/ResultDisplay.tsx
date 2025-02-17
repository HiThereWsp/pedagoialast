
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HeaderSection } from './HeaderSection';
import { FeedbackButtons } from './FeedbackButtons';
import { ExerciseTabs } from './ExerciseTabs';
import { ShareButton } from './ShareButton';
import { AnimatedResultDisplay } from '@/components/shared/AnimatedResultDisplay';

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

  const formatContent = (content: string) => {
    // Supprime les mentions "Fiche élève" redondantes
    let formattedContent = content;
    const sections = content.split('FICHE PÉDAGOGIQUE');
    
    if (sections.length > 1) {
      const studentSection = sections[0].replace(/Fiche élève[\s:-]*/g, '');
      formattedContent = `<h2 class="text-xl font-bold mb-4">Fiche élève</h2>\n\n${studentSection}<h2 class="text-xl font-bold mt-8 mb-4">FICHE PÉDAGOGIQUE</h2>${sections[1]}`;
    }

    // Améliore le formatage général
    formattedContent = formattedContent
      .replace(/Objectif pédagogique/g, 'Objectif pédagogique / Thème')
      .split('\n')
      .map(line => {
        if (line.match(/^[A-Z][\w\s]+:/)) {
          return `<h3 class="text-lg font-bold mt-6 mb-3 text-black">${line}</h3>`;
        }
        if (line.match(/^\d+\./)) {
          return `<p class="ml-4 my-2 text-black font-medium">${line}</p>`;
        }
        if (line.trim().startsWith('-')) {
          return `<p class="ml-6 my-1 text-black">${line}</p>`;
        }
        return line ? `<p class="my-2 text-black">${line}</p>` : '<br/>';
      })
      .join('\n');

    return formattedContent;
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

  const actions = (
    <>
      <FeedbackButtons
        feedbackScore={feedbackScore}
        isCopied={isCopied}
        onFeedback={handleFeedback}
        onCopy={() => handleCopy(exercises)}
      />
      <ShareButton onShare={() => handleCopy(exercises)} />
    </>
  );

  return (
    <Card className="p-4 sm:p-6 relative bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <HeaderSection exerciseCount={exercises} />
      </div>

      <AnimatedResultDisplay
        content={exercises}
        formatContent={formatContent}
        actions={actions}
      />
    </Card>
  );
}
