
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useExerciseContent } from '@/hooks/content/useExerciseContent';
import type { ExerciseFormData } from '@/types/saved-content';

export function useExerciseSaving() {
  const { toast } = useToast();
  const { saveExercise } = useExerciseContent();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [lastGeneratedId, setLastGeneratedId] = useState<string | undefined>(undefined);

  const saveExerciseToDatabase = useCallback(async (
    formData: ExerciseFormData,
    exerciseContent: string,
    isDifferentiation: boolean
  ) => {
    setIsSaving(true);
    setLastSaveError(null);

    try {
      const title = isDifferentiation 
        ? `Exercice différencié - ${formData.subject} - ${formData.classLevel}`
        : `Exercice - ${formData.subject} - ${formData.classLevel}`;

      const exercise_category = isDifferentiation ? 'differentiated' : 'standard';

      const result = await saveExercise({
        title,
        content: exerciseContent,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType,
        source_lesson_plan_id: formData.selectedLessonPlan || undefined,
        source_type: formData.selectedLessonPlan ? 'from_lesson_plan' : 'direct',
        exercise_category
      });
      
      // Check if result exists first
      if (!result) {
        console.error('Save exercise returned null or undefined');
        setLastSaveError('Erreur de sauvegarde inconnue');
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de la sauvegarde de l'exercice. Réessayez ultérieurement."
        });
        return false;
      }
      
      // Handle error case - result could be an object with error property
      if (typeof result === 'object' && 'error' in result && result.error) {
        console.error('Error saving exercise:', result.error);
        const errorMessage = typeof result.error === 'object' && result.error !== null && 'message' in result.error 
          ? String(result.error.message) 
          : 'Erreur inconnue';
        setLastSaveError(errorMessage);
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de la sauvegarde de l'exercice. Réessayez ultérieurement."
        });
        return false;
      }
      
      // Handle success case - result could be a boolean true or an object with data property
      if (typeof result === 'object' && 'data' in result && result.data) {
        // If result.data has an id property, save it
        if (typeof result.data === 'object' && result.data !== null && 'id' in result.data) {
          setLastGeneratedId(String(result.data.id));
        }
      }

      toast({
        description: "🎉 Votre exercice a été sauvegardé avec succès !"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en base de données:', error);
      setLastSaveError(error instanceof Error ? error.message : 'Erreur inconnue');
      
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la sauvegarde de l'exercice. Réessayez ultérieurement."
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [saveExercise, toast]);

  // Fonction pour ré-essayer la sauvegarde manuellement
  const retrySaveExercise = useCallback(async (
    formData: ExerciseFormData, 
    exerciseContent: string, 
    isDifferentiation: boolean
  ) => {
    return await saveExerciseToDatabase(formData, exerciseContent, isDifferentiation);
  }, [saveExerciseToDatabase]);

  return {
    isSaving,
    lastSaveError,
    lastGeneratedId,
    saveExerciseToDatabase,
    retrySaveExercise,
  };
}
