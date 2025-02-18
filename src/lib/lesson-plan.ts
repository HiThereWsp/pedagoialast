
import { supabase } from '@/integrations/supabase/client'

export const generateLessonPlan = async (lessonPlanData: any) => {
  try {
    const { data, error } = await supabase
      .from('lesson_plans')
      .insert([lessonPlanData])
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error generating lesson plan:', error)
    throw error
  }
}

export const getLessonPlans = async (userId: string | undefined) => {
  if (!userId) return []
  
  try {
    const { data, error } = await supabase
      .from('lesson_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching lesson plans:', error)
    throw error
  }
}
