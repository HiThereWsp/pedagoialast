
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface LessonPlanData {
  userId: string
  title: string
  subject: string
  level: string
  topic: string
  duration: number
  learningObjectives: string[]
  materials: string[]
  activities: string[]
  assessment: string
  differentiation: string
  notes: string
  type: string
  tags: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}

export const generateLessonPlan = async (lessonPlanData: LessonPlanData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .insert([{
        user_id: lessonPlanData.userId,
        title: lessonPlanData.title,
        subject: lessonPlanData.subject,
        class_level: lessonPlanData.level,
        content: JSON.stringify({
          topic: lessonPlanData.topic,
          duration: lessonPlanData.duration,
          objectives: lessonPlanData.learningObjectives,
          materials: lessonPlanData.materials,
          activities: lessonPlanData.activities,
          assessment: lessonPlanData.assessment,
          differentiation: lessonPlanData.differentiation,
          notes: lessonPlanData.notes
        }),
        tags: lessonPlanData.tags
      }])
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
      .from('saved_lesson_plans')
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
