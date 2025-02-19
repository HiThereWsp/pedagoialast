
import { supabase } from "@/integrations/supabase/client"
import type { SaveExerciseParams, ExtractedExercise, SavedContent } from "@/types/saved-content"

export const exercisesService = {
  async save(params: SaveExerciseParams) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    
    console.log('Saving exercise with params:', params)
    
    const { error } = await supabase
      .from('saved_exercises')
      .insert([{
        ...params,
        user_id: user.id,
        type: 'exercise' as const,
        source_type: params.source_lesson_plan_id ? 'from_lesson_plan' : 'direct'
      }])

    if (error) {
      console.error('Error saving exercise:', error)
      throw error
    }
  },

  async getAll(): Promise<SavedContent[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    console.log('Fetching exercises for user:', user.id)
    
    const { data, error } = await supabase
      .from('saved_exercises')
      .select('*, saved_lesson_plans!saved_exercises_source_lesson_plan_id_fkey(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching exercises:', error)
      throw error
    }

    const transformedData: SavedContent[] = data.map(exercise => ({
      ...exercise,
      type: 'exercise' as const,
      source_type: exercise.source_type as 'direct' | 'from_lesson_plan'
    }))
    
    console.log('Fetched exercises:', transformedData)
    return transformedData
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    console.log('Deleting exercise:', id)
    
    const { error } = await supabase
      .from('saved_exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting exercise:', error)
      throw error
    }
  },

  async extractFromLessonPlan(exercise: ExtractedExercise) {
    console.log('Extracting exercise from lesson plan:', exercise)
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

    console.log('Fetching exercises for lesson plan:', lessonPlanId)
    
    const { data, error } = await supabase
      .from('saved_exercises')
      .select('*')
      .eq('user_id', user.id)
      .eq('source_lesson_plan_id', lessonPlanId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching exercises from lesson plan:', error)
      throw error
    }
    
    console.log('Fetched exercises from lesson plan:', data)
    return data
  }
}
