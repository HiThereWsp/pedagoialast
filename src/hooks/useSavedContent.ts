
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { exercisesService } from "@/services/exercises"
import { lessonPlansService } from "@/services/lesson-plans"
import type { SaveExerciseParams, SaveLessonPlanParams } from "@/types/saved-content"

export function useSavedContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const saveExercise = async (params: SaveExerciseParams) => {
    try {
      setIsLoading(true)
      await exercisesService.save(params)
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
      await lessonPlansService.save(params)
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
      return await exercisesService.getAll()
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
      return await lessonPlansService.getAll()
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
      await exercisesService.delete(id)
    } catch (error) {
      console.error('Error deleting exercise:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSavedLessonPlan = async (id: string) => {
    try {
      setIsLoading(true)
      await lessonPlansService.delete(id)
    } catch (error) {
      console.error('Error deleting lesson plan:', error)
      throw error
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
