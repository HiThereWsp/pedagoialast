
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLessonPlanForm } from './useLessonPlanForm';
import { useStorageCleanup } from './useStorageCleanup';
import { useLessonPlanUtils } from './useLessonPlanUtils';
import { generateLessonPlan } from '@/api/lesson-plan';
import type { SaveLessonPlanParams } from './types';

/**
 * Hook for managing the lesson plan generation workflow
 */
export function useLessonPlanGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const { toast } = useToast();
  const { formData, handleInputChange, resetLessonPlan, setLessonPlanResult } = useLessonPlanForm();
  const { savePlan } = useLessonPlanUtils();
  
  // Setup localStorage cleanup on navigation
  useStorageCleanup();

  const generate = useCallback(async () => {
    if (isGenerating) return null;

    setIsGenerating(true);
    const generationStartTime = performance.now();
    
    try {
      // Validation
      if (!formData.classLevel.trim()) {
        toast({
          variant: "destructive",
          description: "Veuillez choisir un niveau de classe.",
        });
        return null;
      }

      if (!formData.subject.trim()) {
        toast({
          variant: "destructive",
          description: "Veuillez choisir une matière.",
        });
        return null;
      }

      if (!formData.subject_matter.trim()) {
        toast({
          variant: "destructive",
          description: "Veuillez indiquer l'objet d'étude.",
        });
        return null;
      }

      // Reset any previous generation
      resetLessonPlan();

      // Call the API
      const response = await generateLessonPlan({
        class_level: formData.classLevel,
        subject: formData.subject,
        subject_matter: formData.subject_matter,
        total_sessions: parseInt(formData.totalSessions) || 5,
        additional_instructions: formData.additionalInstructions
      });

      // Process the response and calculate generation time
      const generationEndTime = performance.now();
      const generationTime = generationEndTime - generationStartTime;
      setLastGenerationTime(generationTime);

      if (response) {
        // Save the result
        setLessonPlanResult(response);
        
        // Save to database
        await savePlan(formData, response, generationTime);
        
        return response;
      } else {
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de la génération de la séquence.",
        });
        return null;
      }
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération de la séquence.",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating, 
    formData, 
    toast, 
    resetLessonPlan, 
    setLessonPlanResult, 
    savePlan
  ]);

  return {
    formData,
    isGenerating,
    generate,
    handleInputChange,
    resetLessonPlan
  };
}
