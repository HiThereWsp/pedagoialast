
import { supabase } from "@/integrations/supabase/client"
import type { SaveExerciseParams, ExtractedExercise } from "@/types/saved-content"

export const exercisesService = {
  async save(params: SaveExerciseParams) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    
    const { error } = await supabase
      .from('saved_exercises')
      .insert([{
        ...params,
        user_id: user.id,
        source_type: params.source_lesson_plan_id ? 'from_lesson_plan' : 'direct'
      }])

    if (error) throw error
  },

  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('saved_exercises')
      .select('*, saved_lesson_plans!saved_exercises_source_lesson_plan_id_fkey(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { error } = await supabase
      .from('saved_exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  },

  async extractFromLessonPlan(exercise: ExtractedExercise) {
    return await this.save({
      title: exercise.title,
      content: exercise.content,
      subject: exercise.subject,
      class_level: exercise.class_level,
      source_lesson_plan_id: exercise.lesson_plan_id,
      source_type: 'from_lesson_plan'
    })
  },

  async getExercisesFromLessonPlan(lessonPlanId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('saved_exercises')
      .select('*')
      .eq('user_id', user.id)
      .eq('source_lesson_plan_id', lessonPlanId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
