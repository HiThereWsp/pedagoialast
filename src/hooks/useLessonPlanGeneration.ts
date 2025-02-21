
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { useSavedContent } from '@/hooks/useSavedContent';

interface LessonPlanFormData {
  classLevel: string;
  additionalInstructions: string;
  totalSessions: string;
  subject: string;
  subject_matter?: string;
  text: string;
  lessonPlan: string;
}

export function useLessonPlanGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan } = useSavedContent();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LessonPlanFormData>({
    classLevel: '',
    additionalInstructions: '',
    totalSessions: '',
    subject: '',
    subject_matter: '',
    text: '',
    lessonPlan: ''
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const formatTitle = useCallback((title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  }, []);

  const resetLessonPlan = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lessonPlan: ''
    }));
  }, []);

  const generateLessonPlan = useCallback(async () => {
    if (!formData.classLevel || !formData.totalSessions || !formData.subject_matter) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          classLevel: formData.classLevel,
          totalSessions: formData.totalSessions,
          subject: formData.subject,
          subject_matter: formData.subject_matter,
          text: formData.text,
          additionalInstructions: formData.additionalInstructions
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      
      setFormData(prev => ({
        ...prev,
        lessonPlan: functionData.lessonPlan
      }));

      // Sauvegarde automatique
      const title = formatTitle(`${formData.subject_matter} - ${formData.subject || ''} - ${formData.classLevel}`.trim());
      
      await saveLessonPlan({
        title,
        content: functionData.lessonPlan,
        subject: formData.subject_matter,
        class_level: formData.classLevel,
        total_sessions: parseInt(formData.totalSessions),
        additional_instructions: formData.additionalInstructions
      });

      await logToolUsage('lesson_plan', 'generate', functionData.lessonPlan.length, generationTime);

      toast({
        description: "🎉 Votre séquence a été générée et sauvegardée dans 'Mes ressources' !"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération de la séquence."
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast, logToolUsage, saveLessonPlan]);

  return {
    formData,
    isLoading,
    handleInputChange,
    generateLessonPlan,
    resetLessonPlan
  };
}
