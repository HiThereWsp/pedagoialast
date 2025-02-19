
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  strengths: string;
  challenges: string;
  lessonPlanContent?: string;
  questionsPerExercise?: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<string | null>(null);

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
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Generating exercises with data:', formData);
      
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: parseInt(formData.numberOfExercises) || 1,
          questionsPerExercise: parseInt(formData.questionsPerExercise) || 3,
          specificNeeds: formData.specificNeeds?.trim(),
          strengths: formData.strengths?.trim(),
          challenges: formData.challenges?.trim(),
          lessonPlanContent: formData.lessonPlanContent
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Generated exercises:', data);
      setExercises(data.exercises);
      toast({
        title: "Exercices générés avec succès",
        description: "Vos exercices ont été créés et sauvegardés",
      });
      
      return true;
    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des exercices",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    generateExercises,
  };
}
