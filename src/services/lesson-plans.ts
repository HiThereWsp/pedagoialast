
import { supabase } from "@/integrations/supabase/client"
import type { SaveLessonPlanParams } from "@/types/saved-content"

export const lessonPlansService = {
  async save(params: SaveLessonPlanParams) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    
    const { error } = await supabase
      .from('saved_lesson_plans')
      .insert({
        title: params.title,
        content: params.content,
        subject: params.subject,
        class_level: params.class_level,
        total_sessions: params.total_sessions,
        additional_instructions: params.additional_instructions,
        user_id: user.id
      })

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

    return data.map(plan => ({
      id: plan.id,
      title: plan.title,
      content: plan.content,
      subject: plan.subject,
      class_level: plan.class_level,
      created_at: plan.created_at,
      type: 'lesson-plan' as const,
      tags: [{
        label: 'Séquence',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }))
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { error } = await supabase
      .from('saved_lesson_plans')
      .delete()
      .match({ id, user_id: user.id })

    if (error) throw error
  }
}
