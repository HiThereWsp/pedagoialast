
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FeedbackButtons } from './result/FeedbackButtons';
import { ShareButton } from './result/ShareButton';
import { TabButton } from './result/TabButton';
import { ProgressiveContent } from './result/ProgressiveContent';
import { Loader2 } from "lucide-react";

interface ResultDisplayProps {
  exercises: string | null;
}

type Tab = 'student' | 'correction' | 'teacher';

export function ResultDisplay({ exercises }: ResultDisplayProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!exercises) return null;

  const splitContent = useMemo(() => {
    const parts = exercises.split('FICHE');
    return {
      student: parts[0].trim(),
      correction: parts[1]?.includes('CORRECTION ÉLÈVE') ? parts[1].split('FICHE')[0].trim() : '',
      teacher: parts[2] || parts[1] || ''
    };
  }, [exercises]);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1;
    setFeedbackScore(score);
    toast({
      description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour",
    });
  };

  const handleCopy = useCallback(async () => {
    try {
      setIsLoading(true);
      await navigator.clipboard.writeText(exercises);
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
    } finally {
      setIsLoading(false);
    }
  }, [exercises, toast]);

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
      handleCopy();
    }
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'student':
        return splitContent.student;
      case 'correction':
        return splitContent.correction;
      case 'teacher':
        return splitContent.teacher;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* En-tête avec les onglets */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            <TabButton
              isActive={activeTab === 'student'}
              onClick={() => setActiveTab('student')}
            >
              Fiche Élève
            </TabButton>
            <TabButton
              isActive={activeTab === 'correction'}
              onClick={() => setActiveTab('correction')}
            >
              Correction
            </TabButton>
            <TabButton
              isActive={activeTab === 'teacher'}
              onClick={() => setActiveTab('teacher')}
            >
              Fiche Pédagogique
            </TabButton>
          </div>
          
          <div className="flex justify-between items-center">
            <FeedbackButtons
              feedbackScore={feedbackScore}
              isCopied={isCopied}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
            />
            <ShareButton onShare={handleShare} />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <ProgressiveContent
              content={getActiveContent()}
              className="print:block"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
