
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ProgressiveContent } from './ProgressiveContent';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

interface ScrollCardProps {
  exercises: string | null;
  onBack?: () => void;
  showCorrection?: boolean;
  className?: string;
  customClass?: string;
}

export const ScrollCard = ({ exercises, onBack, showCorrection = true, className, customClass }: ScrollCardProps) => {
  const [activeTab, setActiveTab] = useState('eleve');
  const { toast } = useToast();

  const tabs = [
    { id: 'eleve', label: 'Fiche Élève' },
    ...(showCorrection ? [{ id: 'correction', label: 'Correction' }] : [])
  ];

  const splitContent = useMemo(() => {
    if (!exercises) return { student: '', correction: '' };

    const STUDENT_MARKER = "FICHE ÉLÈVE";
    const CORRECTION_MARKER = "FICHE CORRECTION";

    const studentStart = exercises.indexOf(STUDENT_MARKER);
    const correctionStart = exercises.indexOf(CORRECTION_MARKER);

    let studentContent = '';
    let correctionContent = '';

    if (studentStart !== -1 && correctionStart !== -1) {
      studentContent = exercises
        .substring(studentStart + STUDENT_MARKER.length, correctionStart)
        .trim();
      correctionContent = exercises
        .substring(correctionStart + CORRECTION_MARKER.length)
        .trim();
    }

    return {
      student: studentContent || exercises,
      correction: correctionContent
    };
  }, [exercises]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exercises || '');
      toast({
        description: "Contenu copié dans le presse-papier",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du contenu",
      });
    }
  };

  const handleFeedback = (isPositive: boolean) => {
    toast({
      description: isPositive ? "Merci pour votre retour positif !" : "Merci pour votre retour, nous allons nous améliorer.",
    });
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${className || ''}`}>
      {/* Actions header */}
      <div className="flex justify-end items-center mb-6 gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleFeedback(true)}
          className="text-gray-600 hover:text-gray-800"
        >
          <ThumbsUp className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleFeedback(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          <ThumbsDown className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleCopy}
          className="text-gray-600 hover:text-gray-800"
        >
          <Copy className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs Navigation */}
      {tabs.length > 1 && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-3 text-sm font-medium transition-colors duration-200 
                  ${activeTab === tab.id 
                    ? 'bg-orange-50 text-orange-800 border-orange-300 rounded-lg' 
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main card with scroll content */}
      <Card className="w-full bg-white shadow-lg">
        <CardContent className="h-[600px] md:h-[800px] lg:h-[900px] overflow-y-auto p-8">
          {activeTab === 'eleve' && (
            <ProgressiveContent
              content={splitContent.student}
              className={`prose prose-sm max-w-none print:block ${customClass || ''}`}
            />
          )}

          {activeTab === 'correction' && showCorrection && (
            <ProgressiveContent
              content={splitContent.correction}
              className={`prose prose-sm max-w-none print:block ${customClass || ''}`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
