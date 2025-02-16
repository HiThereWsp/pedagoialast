
import { supabase } from "@/integrations/supabase/client"
import type { SaveLessonPlanParams } from "@/types/saved-content"

export const lessonPlansService = {
  async save(params: SaveLessonPlanParams) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { error } = await supabase
      .from('saved_lesson_plans')
      .insert([{
        ...params,
        user_id: user.id
      }])

    if (error) throw error
  },

  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { error } = await supabase
      .from('saved_lesson_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }
}
