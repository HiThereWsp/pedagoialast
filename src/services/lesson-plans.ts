
import { supabase } from "@/integrations/supabase/client"
import type { SaveLessonPlanParams } from "@/types/saved-content"
import { toast } from "@/hooks/use-toast"

export const lessonPlansService = {
  async save(params: SaveLessonPlanParams) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non authentifié",
          description: "Veuillez vous connecter pour sauvegarder une séquence"
        })
        throw new Error('Non authentifié')
      }
      
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

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder la séquence"
        })
        throw error
      }

      toast({
        title: "Succès",
        description: "Séquence sauvegardée avec succès"
      })
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      throw err
    }
  },

  async create(params: SaveLessonPlanParams) {
    return this.save(params);
  },

  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non authentifié",
          description: "Veuillez vous connecter pour voir vos séquences"
        })
        throw new Error('Non authentifié')
      }

      const { data, error } = await supabase
        .from('saved_lesson_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les séquences"
        })
        throw error
      }

      if (!data) {
        return []
      }

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
    } catch (err) {
      console.error('Erreur lors de la récupération des séquences:', err)
      return []
    }
  },

  async delete(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non authentifié",
          description: "Veuillez vous connecter pour supprimer une séquence"
        })
        throw new Error('Non authentifié')
      }

      const { error } = await supabase
        .from('saved_lesson_plans')
        .delete()
        .match({ id, user_id: user.id })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer la séquence"
        })
        throw error
      }

      toast({
        title: "Succès",
        description: "Séquence supprimée avec succès"
      })
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      throw err
    }
  }
}
