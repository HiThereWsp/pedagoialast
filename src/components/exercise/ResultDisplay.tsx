import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HeaderSection } from './result/HeaderSection';
import { FeedbackButtons } from './result/FeedbackButtons';
import { ExerciseTabs } from './result/ExerciseTabs';
import { ShareButton } from './result/ShareButton';

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

  const splitContent = (content: string) => {
    const parts = content.split('FICHE PÉDAGOGIQUE');
    return {
      studentSheet: parts[0].trim(),
      teacherSheet: parts[1] ? `FICHE PÉDAGOGIQUE${parts[1]}` : ''
    };
  };

  const { studentSheet, teacherSheet } = splitContent(exercises);

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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Exercices générés par Pedagoia',
        text: exercises,
      });
      toast({
        description: "Merci d'avoir partagé ces exercices !",
      });
    } catch (err) {
      await handleCopy(exercises);
      toast({
        description: "Les exercices ont été copiés, vous pouvez maintenant les partager",
      });
    }
  };

  return (
    <Card className="relative bg-white p-4 sm:p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <HeaderSection exerciseCount={exercises} />
        <FeedbackButtons
          feedbackScore={feedbackScore}
          isCopied={isCopied}
          onFeedback={handleFeedback}
          onCopy={() => handleCopy(exercises)}
        />
      </div>

      <ExerciseTabs 
        studentSheet={studentSheet}
        teacherSheet={teacherSheet}
        onCopy={handleCopy}
      />

      <div className="mt-6 flex justify-end">
        <ShareButton onShare={handleShare} />
      </div>
    </Card>
  );
}