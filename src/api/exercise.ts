import { supabase } from '@/integrations/supabase/client';
import type { ExerciseFormData } from '@/types/saved-content';

interface GenerateExerciseParams extends ExerciseFormData {
  isDifferentiation?: boolean;
}

interface ModifyExerciseParams extends GenerateExerciseParams {
  exercise_content: string;
  modification_instructions: string;
}

/**
 * Génère un exercice en appelant la fonction Edge de Supabase
 */
export async function generateExercise(params: GenerateExerciseParams): Promise<string> {
  console.log('Sending exercise generation request');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-exercises', {
      body: params
    });

    if (error) {
      console.error('Error generating exercise:', error);
      throw new Error(error.message);
    }

    if (!data?.exercises) {
      console.error('No exercise returned from the API');
      throw new Error('No exercise data received');
    }

    return data.exercises;
  } catch (error) {
    console.error('Exception in generateExercise:', error);
    throw error;
  }
}

/**
 * Modifie un exercice existant en fonction des instructions fournies
 */
export async function modifyExercise(params: ModifyExerciseParams): Promise<string> {
  console.log('Sending exercise modification request');
  
  try {
    const { data, error } = await supabase.functions.invoke('modify-exercise', {
      body: params
    });

    if (error) {
      console.error('Error modifying exercise:', error);
      throw new Error(error.message);
    }

    if (!data?.exercises) {
      console.error('No modified exercise returned from the API');
      throw new Error('No exercise data received');
    }

    return data.exercises;
  } catch (error) {
    console.error('Exception in modifyExercise:', error);
    throw error;
  }
} 