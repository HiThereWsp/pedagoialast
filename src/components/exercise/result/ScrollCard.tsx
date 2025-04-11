import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from 'lucide-react';
import { ProgressiveContent } from './ProgressiveContent';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentFeedback } from '@/components/common/ContentFeedback';

interface ScrollCardProps {
  exercises: string | null;
  onBack?: () => void;
  showCorrection?: boolean;
  className?: string;
  customClass?: string;
  hideActions?: boolean;
  disableInternalTabs?: boolean;
  contentType?: 'lesson_plan' | 'exercise' | 'correspondence' | 'image_generation';
  contentId?: string;
}

export const ScrollCard = ({ 
  exercises, 
  onBack, 
  showCorrection = true, 
  className, 
  customClass,
  hideActions = false,
  disableInternalTabs = false,
  contentType = 'exercise',
  contentId
}: ScrollCardProps) => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'correction'>(showCorrection ? 'correction' : 'student');

  // Effet pour mettre à jour l'onglet actif lorsque showCorrection change
  useEffect(() => {
    setActiveTab(showCorrection ? 'correction' : 'student');
  }, [showCorrection]);

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

  // Determine content to show based on tabs
  const showTabs = !disableInternalTabs && student && correction;
  const contentToShow = showTabs ? (activeTab === 'correction' ? correction : student) : exercises;

  return (
    <div ref={contentRef} className={`w-full max-w-4xl mx-auto p-4 animate-fade-in ${className || ''}`}>
      {!hideActions && (
        <div className="flex justify-between items-center mb-6">
          <ContentFeedback 
            contentType={contentType}
            contentId={contentId}
          />
          
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

      {showTabs && (
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as 'student' | 'correction')}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="print:hidden">Fiche Élève</TabsTrigger>
            <TabsTrigger value="correction" className="print:hidden">Correction</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Card className="w-full bg-white shadow-lg print:shadow-none print:border-none">
        <CardContent className="h-[600px] md:h-[800px] lg:h-[900px] overflow-y-auto p-8 print:h-auto print:overflow-visible">
          <ProgressiveContent
            content={contentToShow || ''}
            className={`prose prose-sm max-w-none print:block ${customClass || ''}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};
