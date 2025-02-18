
import { supabase } from '@/integrations/supabase/client';
import type { LessonPlanData } from '@/types/saved-content';

export const generateLessonPlan = async (data: LessonPlanData) => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
      body: data
    });

    if (functionError) throw functionError;
    return functionData;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
};

export const getLessonPlans = async (userId?: string) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(plan => ({
      ...plan,
      type: 'lesson-plan' as const,
      tags: [{
        label: 'Séquence',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }));
  } catch (error) {
    console.error('Error fetching lesson plans:', error);
    throw error;
  }
};
