
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLessonPlanForm } from './useLessonPlanForm';
import { useStorageCleanup } from './useStorageCleanup';
import { useLessonPlanUtils } from './useLessonPlanUtils';
import { LessonPlanFormData } from './types';

export function useLessonPlanGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { formData, handleInputChange, resetLessonPlan, setLessonPlanResult } = useLessonPlanForm();
  const { savePlan } = useLessonPlanUtils();
  
  // Setup storage cleanup
  useStorageCleanup();

  const validateForm = useCallback((data: LessonPlanFormData): boolean => {
    // Validation des champs obligatoires
    if (!data.classLevel || !data.totalSessions || !data.subject_matter) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires de niveau, matière et nombre de séances."
      });
      return false;
    }

    // Ajout de la validation des objectifs d'apprentissage (champ subject)
    if (!data.subject || data.subject.trim() === '') {
      toast({
        variant: "destructive",
        description: "Veuillez définir les objectifs d'apprentissage de votre séquence."
      });
      return false;
    }

    return true;
  }, [toast]);

  const generateLessonPlan = useCallback(async () => {
    // Validate the form
    if (!validateForm(formData)) {
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

      // Vérifier si nous avons une erreur spécifique renvoyée par la fonction
      if (functionData.error) {
        if (functionData.error === 'TIMEOUT_ERROR') {
          toast({
            variant: "destructive",
            title: "Temps de génération dépassé",
            description: "La génération est trop complexe. Essayez de réduire la complexité ou le nombre de séances."
          });
        } else {
          toast({
            variant: "destructive",
            description: functionData.message || "Une erreur est survenue lors de la génération."
          });
        }
        return;
      }

      const generationTime = Math.round(performance.now() - startTime);
      
      // Mise à jour du state avec le nouveau plan de leçon
      const newLessonPlan = functionData.lessonPlan;
      setLessonPlanResult(newLessonPlan);

      // Sauvegarde automatique et log d'utilisation
      await savePlan(formData, newLessonPlan, generationTime);

      toast({
        description: "🎉 Votre séquence a été générée et sauvegardée dans 'Mes ressources' !"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Une erreur est survenue lors de la génération de la séquence. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast, setLessonPlanResult, savePlan, validateForm]);

  return {
    formData,
    isLoading,
    handleInputChange,
    generateLessonPlan,
    resetLessonPlan
  };
}
