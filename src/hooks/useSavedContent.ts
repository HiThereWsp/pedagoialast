
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { exercisesService } from "@/services/exercises"
import { lessonPlansService } from "@/services/lesson-plans"
import type { SaveExerciseParams, SaveLessonPlanParams } from "@/types/saved-content"

export function useSavedContent() {
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)
  const [isLoadingLessonPlans, setIsLoadingLessonPlans] = useState(false)
  const { toast } = useToast()

  const saveExercise = async (params: SaveExerciseParams) => {
    try {
      setIsLoadingExercises(true)
      await exercisesService.save(params)
      toast({
        title: "Exercice sauvegardé",
        description: "Votre exercice a été sauvegardé avec succès"
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de 15 contenus sauvegardés"
        })
      } else {
        console.error('Error saving exercise:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        })
      }
    } finally {
      setIsLoadingExercises(false)
    }
  }

  const saveLessonPlan = async (params: SaveLessonPlanParams) => {
    try {
      setIsLoadingLessonPlans(true)
      await lessonPlansService.save(params)
      toast({
        title: "Séquence sauvegardée",
        description: "Votre séquence a été sauvegardée avec succès"
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de 15 contenus sauvegardés"
        })
      } else {
        console.error('Error saving lesson plan:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        })
      }
    } finally {
      setIsLoadingLessonPlans(false)
    }
  }

  const getSavedExercises = async () => {
    try {
      setIsLoadingExercises(true)
      return await exercisesService.getAll()
    } catch (error) {
      console.error('Error fetching exercises:', error)
      throw error
    } finally {
      setIsLoadingExercises(false)
    }
  }

  const getSavedLessonPlans = async () => {
    try {
      setIsLoadingLessonPlans(true)
      return await lessonPlansService.getAll()
    } catch (error) {
      console.error('Error fetching lesson plans:', error)
      throw error
    } finally {
      setIsLoadingLessonPlans(false)
    }
  }

  const deleteSavedExercise = async (id: string) => {
    try {
      setIsLoadingExercises(true)
      await exercisesService.delete(id)
    } catch (error) {
      console.error('Error deleting exercise:', error)
      throw error
    } finally {
      setIsLoadingExercises(false)
    }
  }

  const deleteSavedLessonPlan = async (id: string) => {
    try {
      setIsLoadingLessonPlans(true)
      await lessonPlansService.delete(id)
    } catch (error) {
      console.error('Error deleting lesson plan:', error)
      throw error
    } finally {
      setIsLoadingLessonPlans(false)
    }
  }

  return {
    isLoadingExercises,
    isLoadingLessonPlans,
    saveExercise,
    saveLessonPlan,
    getSavedExercises,
    getSavedLessonPlans,
    deleteSavedExercise,
    deleteSavedLessonPlan
  }
}
