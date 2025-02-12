
import { supabase } from "@/integrations/supabase/client"
import type { SaveLessonPlanParams } from "@/types/saved-content"

export const lessonPlansService = {
  async save(params: SaveLessonPlanParams) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('saved_lesson_plans')
      .insert([{
        ...params,
        user_id: user?.id
      }])

    if (error) throw error
  },

  async getAll() {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('saved_lesson_plans')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
