
import React, { useEffect, useRef } from 'react';
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
  hideActions?: boolean;
  disableInternalTabs?: boolean;
}

export const ScrollCard = ({ 
  exercises, 
  onBack, 
  showCorrection = true, 
  className, 
  customClass,
  hideActions = false,
  disableInternalTabs = false
}: ScrollCardProps) => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [exercises]);

  const splitContent = (content: string) => {
    if (!content) return { student: '', correction: '' };

    const STUDENT_MARKER = "FICHE ÉLÈVE";
    const CORRECTION_MARKER = "FICHE CORRECTION";

    const studentStart = content.indexOf(STUDENT_MARKER);
    const correctionStart = content.indexOf(CORRECTION_MARKER);

    if (studentStart !== -1 && correctionStart !== -1) {
      return {
        student: content
          .substring(studentStart + STUDENT_MARKER.length, correctionStart)
          .trim(),
        correction: content
          .substring(correctionStart + CORRECTION_MARKER.length)
          .trim()
      };
    }

    return {
      student: content,
      correction: ''
    };
  };

  const { student, correction } = splitContent(exercises || '');

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
      description: isPositive 
        ? "Merci pour votre retour positif !" 
        : "Merci pour votre retour, nous allons nous améliorer.",
    });
  };

  return (
    <div ref={contentRef} className={`w-full max-w-4xl mx-auto p-4 animate-fade-in ${className || ''}`}>
      {!hideActions && (
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
      )}

      <Card className="w-full bg-white shadow-lg">
        <CardContent className="h-[600px] md:h-[800px] lg:h-[900px] overflow-y-auto p-8">
          <ProgressiveContent
            content={showCorrection ? correction : student}
            className={`prose prose-sm max-w-none print:block ${customClass || ''}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};
