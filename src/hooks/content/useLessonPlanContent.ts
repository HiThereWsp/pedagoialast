
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { lessonPlansService } from "@/services/lesson-plans";
import type { SaveLessonPlanParams } from "@/types/saved-content";
import { FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from "@/hooks/lesson-plan/types";

export function useLessonPlanContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveLessonPlan = async (params: SaveLessonPlanParams) => {
    try {
      setIsLoading(true);
      await lessonPlansService.save(params);
      toast({
        title: "Séquence sauvegardée",
        description: "Votre séquence a été sauvegardée avec succès"
      });
      
      // Optional: clear cache after successful save to avoid duplicates
      // Only uncomment if you want to reset form after save
      // localStorage.removeItem(FORM_STORAGE_KEY);
      // localStorage.removeItem(RESULT_STORAGE_KEY);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de contenu sauvegardé"
        });
      } else {
        console.error('Error saving lesson plan:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSavedLessonPlans = async () => {
    try {
      setIsLoading(true);
      return await lessonPlansService.getAll();
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedLessonPlan = async (id: string) => {
    try {
      setIsLoading(true);
      await lessonPlansService.delete(id);
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveLessonPlan,
    getSavedLessonPlans,
    deleteSavedLessonPlan
  };
}
