import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { generateExercise, modifyExercise } from '@/api/exercise';
import type { ExerciseFormData } from '@/types/saved-content';

export function useExerciseGenerator() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  const generateExerciseContent = useCallback(async (
    formData: ExerciseFormData, 
    isDifferentiation: boolean = false
  ) => {
    if (!formData.subject || !formData.classLevel || 
      (isDifferentiation && (!formData.originalExercise || !formData.studentProfile)) ||
      (!isDifferentiation && !formData.objective)) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return null;
    }
    
    setIsLoading(true);
    const startTime = performance.now();

    try {
      console.log('Génération d\'exercice avec les données:', {
        sujet: formData.subject,
        niveau: formData.classLevel,
        differentiation: isDifferentiation
      });
      
      const exerciseContent = await generateExercise({
        ...formData,
        isDifferentiation
      });

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'generate', exerciseContent?.length || 0, generationTime);

      return exerciseContent || "";

    } catch (error) {
      console.error('Erreur lors de la génération des exercices:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération des exercices."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, logToolUsage]);

  const modifyExerciseContent = useCallback(async (
    formData: ExerciseFormData,
    originalExerciseContent: string,
    modificationInstructions: string,
    isDifferentiation: boolean = false
  ) => {
    if (!originalExerciseContent || !modificationInstructions || !formData.subject || !formData.classLevel) {
      toast({
        variant: "destructive",
        description: "Données manquantes pour la modification de l'exercice."
      });
      return null;
    }
    
    setIsModifying(true);
    const startTime = performance.now();

    try {
      console.log('Modification d\'exercice avec les données:', {
        sujet: formData.subject,
        niveau: formData.classLevel,
        differentiation: isDifferentiation,
        instructionsLength: modificationInstructions.length
      });
      
      const modifiedExerciseContent = await modifyExercise({
        ...formData,
        isDifferentiation,
        exercise_content: originalExerciseContent,
        modification_instructions: modificationInstructions
      });

      const modificationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'modify', modifiedExerciseContent?.length || 0, modificationTime);

      return modifiedExerciseContent || "";

    } catch (error) {
      console.error('Erreur lors de la modification des exercices:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la modification de l'exercice."
      });
      return null;
    } finally {
      setIsModifying(false);
    }
  }, [toast, logToolUsage]);

  return {
    isLoading,
    isModifying,
    generateExerciseContent,
    modifyExerciseContent
  };
}
