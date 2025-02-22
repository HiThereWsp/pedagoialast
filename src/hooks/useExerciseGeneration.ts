
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { useExerciseContent } from '@/hooks/content/useExerciseContent';

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  questionsPerExercise: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  originalExercise: string;
  studentProfile: string;
  learningDifficulties: string;
  selectedLessonPlan?: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveExercise } = useExerciseContent();
  const [isLoading, setIsLoading] = useState(false);

  const generateExercises = useCallback(async (formData: ExerciseFormData, isDifferentiation: boolean = false) => {
    if (!formData.subject || !formData.classLevel || !formData.objective) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return null;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          isDifferentiation
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'generate', functionData?.exercises?.length || 0, generationTime);

      // Sauvegarder l'exercice généré
      if (functionData?.exercises) {
        const title = `Exercice - ${formData.subject} - ${formData.classLevel}`;
        await saveExercise({
          title,
          content: functionData.exercises,
          subject: formData.subject,
          class_level: formData.classLevel,
          exercise_type: formData.exerciseType,
          source_lesson_plan_id: formData.selectedLessonPlan || undefined,
          source_type: formData.selectedLessonPlan ? 'from_lesson_plan' : 'direct'
        });
      }

      toast({
        description: "🎉 Vos exercices ont été générés et sauvegardés avec succès !"
      });

      return functionData?.exercises || "";

    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération des exercices."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, logToolUsage, saveExercise]);

  return {
    isLoading,
    generateExercises
  };
}
