
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

  const generateExercises = async (formData: ExerciseFormData): Promise<GenerationResult | null> => {
    if (!validateFormData(formData)) {
      return null;
    }

    setIsLoading(true);
    console.log("🔵 Début de la génération d'exercices");

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: parseInt(formData.numberOfExercises) || 4,
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

      if (!data?.exercises) {
        throw new Error('Pas de contenu généré');
      }

      const title = `${formData.subject} - ${formData.objective} - ${formData.classLevel}`;

      return {
        content: data.exercises,
        title,
        metadata: {
          subject: formData.subject,
          classLevel: formData.classLevel,
          exerciseType: formData.exerciseType,
          specificNeeds: formData.specificNeeds,
        }
      };
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
