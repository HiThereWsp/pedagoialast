
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
  strengths: string;
  challenges: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = (formData: ExerciseFormData) => {
    if (!formData.subject.trim()) {
      toast({
        title: "Matière requise",
        description: "Veuillez spécifier la matière",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.classLevel.trim()) {
      toast({
        title: "Niveau requis",
        description: "Veuillez spécifier le niveau de la classe",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.objective.trim()) {
      toast({
        title: "Objectif requis",
        description: "Veuillez spécifier l'objectif de l'exercice",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generateExercises = async (formData: ExerciseFormData) => {
    if (!validateFormData(formData)) {
      return null;
    }

    setIsLoading(true);
    console.log("🔵 Début de la génération d'exercices");

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: parseInt(formData.numberOfExercises) || 3,
          questionsPerExercise: parseInt(formData.questionsPerExercise) || 5,
          specificNeeds: formData.specificNeeds.trim(),
          strengths: formData.strengths.trim(),
          challenges: formData.challenges.trim()
        }
      });

      if (error) {
        console.error('❌ Erreur de l\'Edge Function:', error);
        throw error;
      }

      // Post-traitement pour retirer les formatages indésirables
      const cleanedExercises = data.exercises
        .replace(/###/g, '')
        .replace(/---/g, '')
        .trim();

      console.log("✅ Exercices générés avec succès");
      return cleanedExercises;
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

  return {
    isLoading,
    generateExercises,
  };
}
