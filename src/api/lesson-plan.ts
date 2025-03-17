
import { supabase } from '@/integrations/supabase/client';

interface LessonPlanParams {
  class_level: string;
  subject: string;
  subject_matter: string;
  total_sessions: number;
  additional_instructions?: string;
  text?: string;
}

/**
 * Generates a lesson plan using the Supabase Edge Function
 */
export async function generateLessonPlan(params: LessonPlanParams): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
    body: params
  });

  if (error) {
    console.error('Error generating lesson plan:', error);
    throw new Error(error.message);
  }

  return data?.lessonPlan || "";
}
