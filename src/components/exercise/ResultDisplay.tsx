import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HeaderSection } from './result/HeaderSection';
import { FeedbackButtons } from './result/FeedbackButtons';
import { MarkdownContent } from './result/MarkdownContent';
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

  const formatText = (markdown: string) => {
    let text = markdown.replace(/<[^>]*>/g, '');
    text = text.replace(/### (.*?)\n/g, '$1\n');
    text = text.replace(/## (.*?)\n/g, '$1\n');
    text = text.replace(/# (.*?)\n/g, '$1\n');
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/\\\((.*?)\\\)/g, '$1');
    text = text.replace(/- /g, '\n- ');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  };

  const getShareableText = (formattedText: string) => {
    return `Bonjour collègue, voici ce que j'ai pu créer avec PedagoIA aujourd'hui :\n\n${formattedText}`;
  };

  const handleCopy = async () => {
    try {
      const formattedText = formatText(exercises);
      const shareableText = getShareableText(formattedText);
      await navigator.clipboard.writeText(shareableText);
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

  const handleShare = async () => {
    try {
      const formattedText = formatText(exercises);
      const shareableText = getShareableText(formattedText);
      await navigator.share({
        title: 'Exercices générés par Pedagoia',
        text: shareableText,
      });
      toast({
        description: "Merci d'avoir partagé ces exercices !",
      });
    } catch (err) {
      await handleCopy();
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
          onCopy={handleCopy}
        />
      </div>
      <MarkdownContent content={exercises} />
      <div className="mt-6 flex justify-end">
        <ShareButton onShare={handleShare} />
      </div>
    </Card>
  );
}