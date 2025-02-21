
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2 } from 'lucide-react';
import { ProgressiveContent } from './ProgressiveContent';
import { useToast } from "@/hooks/use-toast";

interface ScrollCardProps {
  exercises: string | null;
  onBack?: () => void;
}

export const ScrollCard = ({ exercises, onBack }: ScrollCardProps) => {
  const [activeTab, setActiveTab] = useState('eleve');
  const { toast } = useToast();

  const tabs = [
    { id: 'eleve', label: 'Fiche Élève' },
    { id: 'correction', label: 'Correction' }
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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Exercices générés par PedagoIA',
        text: exercises || '',
      });
      toast({
        description: "Merci d'avoir partagé ces exercices !",
      });
    } catch (err) {
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
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Navigation header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Partager
        </button>
      </div>

      {/* Tabs Navigation */}
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

      {/* Main card with scroll content */}
      <Card className="w-full bg-white shadow-lg">
        <CardContent className="h-[600px] overflow-y-auto p-8">
          {activeTab === 'eleve' && (
            <ProgressiveContent
              content={splitContent.student}
              className="prose prose-sm max-w-none print:block"
            />
          )}

          {activeTab === 'correction' && (
            <ProgressiveContent
              content={splitContent.correction}
              className="prose prose-sm max-w-none print:block"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
