
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface SavedContent {
  id: string
  title: string
  content: string
  subject?: string
  class_level?: string
  created_at: string
}

interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
}

interface SaveLessonPlanParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  total_sessions?: number
  additional_instructions?: string
}

export function useSavedContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const saveExercise = async (params: SaveExerciseParams) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('saved_exercises')
        .insert([{
          ...params,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])

      if (error) throw error

      toast({
        title: "Exercice sauvegardé",
        description: "Votre exercice a été sauvegardé avec succès"
      })

    } catch (error) {
      console.error('Error saving exercise:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveLessonPlan = async (params: SaveLessonPlanParams) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('saved_lesson_plans')
        .insert([{
          ...params,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])

      if (error) throw error

      toast({
        title: "Séquence sauvegardée",
        description: "Votre séquence a été sauvegardée avec succès"
      })

    } catch (error) {
      console.error('Error saving lesson plan:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSavedExercises = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('saved_exercises')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data

    } catch (error) {
      console.error('Error fetching exercises:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des exercices"
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getSavedLessonPlans = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('saved_lesson_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data

    } catch (error) {
      console.error('Error fetching lesson plans:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des séquences"
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSavedExercise = async (id: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('saved_exercises')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Exercice supprimé",
        description: "L'exercice a été supprimé avec succès"
      })

    } catch (error) {
      console.error('Error deleting exercise:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSavedLessonPlan = async (id: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('saved_lesson_plans')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Séquence supprimée",
        description: "La séquence a été supprimée avec succès"
      })

    } catch (error) {
      console.error('Error deleting lesson plan:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    saveExercise,
    saveLessonPlan,
    getSavedExercises,
    getSavedLessonPlans,
    deleteSavedExercise,
    deleteSavedLessonPlan
  }
}
