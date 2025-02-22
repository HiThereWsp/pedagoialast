
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { exercisesService } from "@/services/exercises";
import type { SaveExerciseParams, SavedContent } from "@/types/saved-content";
import { exerciseCategories } from "@/components/saved-content/CarouselCategories";

export function useExerciseContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveExercise = async (params: SaveExerciseParams) => {
    try {
      setIsLoading(true);
      await exercisesService.save(params);
      toast({
        title: "Exercice sauvegardé",
        description: "Votre exercice a été sauvegardé avec succès"
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de contenu sauvegardé"
        });
      } else {
        console.error('Error saving exercise:', error);
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

  const getSavedExercises = async () => {
    try {
      setIsLoading(true);
      const exercises = await exercisesService.getAll();
      return exercises.map(exercise => ({
        ...exercise,
        type: 'exercise' as const,
        displayType: 'Exercice',
        tags: [
          {
            label: (exercise as any).exercise_category === 'differentiated' 
              ? exerciseCategories.differentiated.label 
              : exerciseCategories.standard.label,
            ...(exerciseCategories[(exercise as any).exercise_category || 'standard'])
          }
        ]
      })) as SavedContent[];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedExercise = async (id: string) => {
    try {
      setIsLoading(true);
      await exercisesService.delete(id);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveExercise,
    getSavedExercises,
    deleteSavedExercise
  };
}
