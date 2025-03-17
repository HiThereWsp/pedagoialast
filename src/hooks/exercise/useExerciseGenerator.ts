
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import type { ExerciseFormData } from '@/types/saved-content';

export function useExerciseGenerator() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const [isLoading, setIsLoading] = useState(false);

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
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          isDifferentiation
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'generate', functionData?.exercises?.length || 0, generationTime);

      return functionData?.exercises || "";

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

  return {
    isLoading,
    generateExerciseContent
  };
}
