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
  originalExercise: string;
  studentProfile: string;
  learningDifficulties: string;
  strengths?: string;
  challenges?: string;
  learningStyle?: string;
}

export interface GenerationResult {
  content: string;
  title: string;
  metadata: {
    subject: string;
    classLevel: string;
    exerciseType: string;
    specificNeeds: string;
  };
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = (formData: ExerciseFormData, isDifferentiation: boolean) => {
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

    if (isDifferentiation && !formData.originalExercise.trim()) {
      toast({
        title: "Exercice original requis",
        description: "Veuillez fournir l'exercice à différencier",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generateExercises = async (formData: ExerciseFormData, isDifferentiation: boolean = false): Promise<string | null> => {
    if (!validateFormData(formData, isDifferentiation)) {
      return null;
    }

    setIsLoading(true);
    console.log("🔵 Début de la génération d'exercices avec Mistral AI");

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          isDifferentiation,
          numberOfExercises: parseInt(formData.numberOfExercises) || 4,
          questionsPerExercise: parseInt(formData.questionsPerExercise) || 5,
          specificNeeds: formData.specificNeeds.trim(),
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
        description: error.message === "Délai d'attente dépassé" 
          ? "La génération a pris trop de temps, veuillez réessayer"
          : "Une erreur est survenue lors de la génération des exercices",
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
