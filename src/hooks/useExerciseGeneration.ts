import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<string | null>(null);

  const validateFormData = (formData: ExerciseFormData) => {
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
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: formData
      });

      if (error) throw error;

      setExercises(data.exercises);
      toast({
        title: "Exercices générés avec succès",
        description: "Vos exercices ont été créés",
      });
    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des exercices",
        variant: "destructive",
      });
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