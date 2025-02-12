
import { supabase } from "@/integrations/supabase/client"
import type { SaveExerciseParams } from "@/types/saved-content"

export const exercisesService = {
  async save(params: SaveExerciseParams) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('saved_exercises')
      .insert([{
        ...params,
        user_id: user?.id
      }])

    if (error) throw error
  },

  async getAll() {
    const { data, error } = await supabase
      .from('saved_exercises')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('saved_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
