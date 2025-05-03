import { supabase } from '@/integrations/supabase/client';

interface LessonPlanParams {
  class_level: string;
  subject: string;
  subject_matter: string;
  total_sessions: number;
  additional_instructions?: string;
  text?: string;
}

interface ModifyLessonPlanParams extends LessonPlanParams {
  original_lesson_plan: string;
  modification_instructions: string;
}

/**
 * Generates a lesson plan using the Supabase Edge Function
 */
export async function generateLessonPlan(params: LessonPlanParams): Promise<string> {
  console.log('Sending lesson plan generation request with params:', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
      body: params
    });

    if (error) {
      console.error('Error generating lesson plan:', error);
      throw new Error(error.message);
    }

    if (!data?.lessonPlan) {
      console.error('No lesson plan returned from the API');
      throw new Error('No lesson plan data received');
    }

    return data.lessonPlan;
  } catch (error) {
    console.error('Exception in generateLessonPlan:', error);
    throw error;
  }
}

/**
 * Modifies an existing lesson plan based on user instructions
 */
export async function modifyLessonPlan(params: ModifyLessonPlanParams): Promise<string> {
  console.log('Sending lesson plan modification request with instructions');
  
  try {
    const { data, error } = await supabase.functions.invoke('modify-lesson-plan', {
      body: params
    });

    if (error) {
      console.error('Error modifying lesson plan:', error);
      throw new Error(error.message);
    }

    if (!data?.lessonPlan) {
      console.error('No modified lesson plan returned from the API');
      throw new Error('No lesson plan data received');
    }

    return data.lessonPlan;
  } catch (error) {
    console.error('Exception in modifyLessonPlan:', error);
    throw error;
  }
}
