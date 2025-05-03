import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLessonPlanForm } from './useLessonPlanForm';
import { useStorageCleanup } from './useStorageCleanup';
import { useLessonPlanUtils } from './useLessonPlanUtils';
import { generateLessonPlan, modifyLessonPlan } from '@/api/lesson-plan';
import type { SaveLessonPlanParams } from './types';

/**
 * Hook for managing the lesson plan generation workflow
 */
export function useLessonPlanGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [modificationInstructions, setModificationInstructions] = useState('');
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const { toast } = useToast();
  const { formData, handleInputChange, resetLessonPlan, setLessonPlanResult } = useLessonPlanForm();
  const { savePlan, trackModification } = useLessonPlanUtils();
  
  // Setup localStorage cleanup on navigation
  useStorageCleanup();

  // Fonctions pour gérer l'affichage du formulaire de modification
  const toggleModificationForm = useCallback(() => {
    setShowModificationForm(prev => !prev);
    if (showModificationForm) {
      setModificationInstructions('');
    }
  }, [showModificationForm]);

  const handleModificationInstructionsChange = useCallback((value: string) => {
    setModificationInstructions(value);
  }, []);

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

      if (!formData.subject_matter?.trim()) {
        toast({
          variant: "destructive",
          description: "Veuillez indiquer l'objet d'étude.",
        });
        return null;
      }

      // Reset any previous generation
      resetLessonPlan();

      // Convert totalSessions to a number and ensure proper parameter naming
      const totalSessions = parseInt(formData.totalSessions) || 5;
      
      console.log('Preparing lesson plan request with data:', {
        class_level: formData.classLevel,
        subject: formData.subject,
        subject_matter: formData.subject_matter,
        total_sessions: totalSessions,
        text: formData.text || undefined,
        additionalInstructions: formData.additionalInstructions || undefined,
      });
      
      // Call the API with underscore_case parameters to match the edge function
      const response = await generateLessonPlan({
        class_level: formData.classLevel,
        subject: formData.subject,
        subject_matter: formData.subject_matter,
        total_sessions: totalSessions,
        additional_instructions: formData.additionalInstructions,
        text: formData.text
      });

      // Process the response and calculate generation time
      const generationEndTime = performance.now();
      const generationTime = generationEndTime - generationStartTime;
      setLastGenerationTime(Math.round(generationTime)); // Round here too for UI consistency

      if (response) {
        // Save the result
        setLessonPlanResult(response);
        
        try {
          // Save to database - wrap in try/catch to prevent errors here from affecting UI
          await savePlan(formData, response, generationTime);
        } catch (saveError) {
          console.error('Error saving lesson plan:', saveError);
          // Don't show toast here as it might confuse the user since the plan was generated successfully
        }
        
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

  // Nouvelle fonction pour modifier une séquence existante
  const modifyPlan = useCallback(async () => {
    if (isModifying || !formData.lessonPlan || !modificationInstructions.trim()) {
      return null;
    }

    setIsModifying(true);
    const modificationStartTime = performance.now();
    
    try {
      // Validation
      if (!modificationInstructions.trim()) {
        toast({
          variant: "destructive",
          description: "Veuillez indiquer les modifications souhaitées.",
        });
        return null;
      }

      // Convert totalSessions to a number
      const totalSessions = parseInt(formData.totalSessions) || 5;
      
      console.log('Preparing lesson plan modification request');
      
      // Call the API to modify the lesson plan
      const response = await modifyLessonPlan({
        class_level: formData.classLevel,
        subject: formData.subject,
        subject_matter: formData.subject_matter,
        total_sessions: totalSessions,
        additional_instructions: formData.additionalInstructions,
        text: formData.text,
        original_lesson_plan: formData.lessonPlan,
        modification_instructions: modificationInstructions
      });

      // Process the response and calculate modification time
      const modificationEndTime = performance.now();
      const modificationTime = modificationEndTime - modificationStartTime;

      if (response) {
        // Save the modified result
        setLessonPlanResult(response);
        
        try {
          // Save to database, replacing the original
          await savePlan(formData, response, modificationTime);
          
          // Suivre l'événement de modification
          trackModification(modificationTime, response.length);
        } catch (saveError) {
          console.error('Error saving modified lesson plan:', saveError);
        }
        
        // Reset the modification form
        setShowModificationForm(false);
        setModificationInstructions('');
        
        toast({
          description: "Votre séquence a été modifiée avec succès.",
        });
        
        return response;
      } else {
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors de la modification de la séquence.",
        });
        return null;
      }
    } catch (error) {
      console.error('Error modifying lesson plan:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la modification de la séquence.",
      });
      return null;
    } finally {
      setIsModifying(false);
    }
  }, [
    isModifying,
    formData,
    modificationInstructions,
    toast,
    setLessonPlanResult,
    savePlan,
    trackModification
  ]);

  return {
    formData,
    isGenerating,
    isModifying,
    showModificationForm,
    modificationInstructions,
    generate,
    modifyPlan,
    toggleModificationForm,
    handleModificationInstructionsChange,
    handleInputChange,
    resetLessonPlan
  };
}
