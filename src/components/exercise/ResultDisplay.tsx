
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

  const formatContent = (content: string) => {
    // Supprime les mentions "Fiche élève" redondantes
    let formattedContent = content;
    const sections = content.split('FICHE PÉDAGOGIQUE');
    
    if (sections.length > 1) {
      // Pour la fiche élève, on ne garde qu'une seule mention "Fiche élève"
      const studentSection = sections[0].replace(/Fiche élève[\s:-]*/g, '');
      formattedContent = `Fiche élève\n\n${studentSection}FICHE PÉDAGOGIQUE${sections[1]}`;
    }

    // Remplace "Objectif pédagogique" par "Objectif pédagogique / Thème"
    formattedContent = formattedContent.replace(/Objectif pédagogique/g, 'Objectif pédagogique / Thème');

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

  const splitContent = (content: string) => {
    const parts = content.split('FICHE PÉDAGOGIQUE');
    return {
      studentSheet: formatContent(parts[0]).trim(),
      teacherSheet: parts[1] ? `FICHE PÉDAGOGIQUE${parts[1]}` : ''
    };
  };

  const { studentSheet, teacherSheet } = splitContent(exercises);

  return (
    <Card className="p-4 sm:p-6 relative bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
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
        <ShareButton onShare={() => handleCopy(exercises)} />
      </div>
    </Card>
  );
}
