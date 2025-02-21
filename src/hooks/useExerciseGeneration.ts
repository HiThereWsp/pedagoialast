
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  questionsPerExercise: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  challenges: string;
  originalExercise?: string;
  studentProfile?: string;
  learningDifficulties?: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateExercises = async (formData: ExerciseFormData): Promise<string | null> => {
    if (!validateFormData(formData)) {
      return null;
    }

    setIsLoading(true);
    console.log("🔵 Début de la génération d'exercices");

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: formData.numberOfExercises.toString(),
          questionsPerExercise: formData.questionsPerExercise.toString()
        }
      });

      if (error) {
        console.error('❌ Erreur de l\'Edge Function:', error);
        throw error;
      }

      if (!data?.exercises) {
        throw new Error('Pas de contenu généré');
      }

      console.log("✅ Exercices générés avec succès");
      return data.exercises;

    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des exercices",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const validateFormData = (formData: ExerciseFormData): boolean => {
    const requiredFields = ['subject', 'classLevel', 'objective'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ExerciseFormData]?.trim());

    if (missingFields.length > 0) {
      toast({
        title: "Champs requis",
        description: `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    isLoading,
    generateExercises,
  };
}
