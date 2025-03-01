
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { useExerciseContent } from '@/hooks/content/useExerciseContent';
import type { ExerciseFormData } from '@/types/saved-content';

// Constantes pour le stockage local
const EXERCISE_FORM_CACHE_KEY = 'pedagogia_exercise_form_data';
const EXERCISE_RESULT_CACHE_KEY = 'pedagogia_exercise_result';
const EXERCISE_TAB_CACHE_KEY = 'pedagogia_exercise_active_tab';

export function useExerciseGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveExercise } = useExerciseContent();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);

  // Fonction utilitaire pour sauvegarder dans sessionStorage
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde dans le cache:', error);
      // En cas d'erreur (ex: mode navigation privée), on continue silencieusement
    }
  }, []);

  // Fonction utilitaire pour récupérer depuis sessionStorage
  const getFromCache = useCallback((key: string) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Erreur lors de la récupération depuis le cache:', error);
      return null;
    }
  }, []);

  const saveExerciseToDatabase = useCallback(async (
    formData: ExerciseFormData,
    exerciseContent: string,
    isDifferentiation: boolean
  ) => {
    setIsSaving(true);
    setLastSaveError(null);

    try {
      const title = isDifferentiation 
        ? `Exercice différencié - ${formData.subject} - ${formData.classLevel}`
        : `Exercice - ${formData.subject} - ${formData.classLevel}`;

      const exercise_category = isDifferentiation ? 'differentiated' : 'standard';

      await saveExercise({
        title,
        content: exerciseContent,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType,
        source_lesson_plan_id: formData.selectedLessonPlan || undefined,
        source_type: formData.selectedLessonPlan ? 'from_lesson_plan' : 'direct',
        exercise_category
      });

      toast({
        description: "🎉 Votre exercice a été sauvegardé avec succès !"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en base de données:', error);
      setLastSaveError(error instanceof Error ? error.message : 'Erreur inconnue');
      
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la sauvegarde de l'exercice. Réessayez ultérieurement."
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [saveExercise, toast]);

  const generateExercises = useCallback(async (formData: ExerciseFormData, isDifferentiation: boolean = false) => {
    if (!formData.subject || !formData.classLevel || 
        (isDifferentiation && (!formData.originalExercise || !formData.studentProfile)) ||
        (!isDifferentiation && !formData.objective)) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return null;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Sauvegarder le formulaire dans le cache avant génération
      saveToCache(EXERCISE_FORM_CACHE_KEY, formData);
      saveToCache(EXERCISE_TAB_CACHE_KEY, isDifferentiation ? 'differentiate' : 'create');
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          isDifferentiation
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'generate', functionData?.exercises?.length || 0, generationTime);

      // Sauvegarder le résultat de la génération dans le cache
      if (functionData?.exercises) {
        saveToCache(EXERCISE_RESULT_CACHE_KEY, functionData.exercises);
        
        // Sauvegarde en base de données avec gestion des erreurs
        await saveExerciseToDatabase(formData, functionData.exercises, isDifferentiation);
      }

      return functionData?.exercises || "";

    } catch (error) {
      console.error('Erreur lors de la génération des exercices:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération des exercices."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, logToolUsage, saveToCache, saveExerciseToDatabase]);

  // Fonction pour récupérer l'état du cache
  const getExerciseCacheState = useCallback(() => {
    return {
      formData: getFromCache(EXERCISE_FORM_CACHE_KEY) as ExerciseFormData | null,
      exerciseResult: getFromCache(EXERCISE_RESULT_CACHE_KEY) as string | null,
      activeTab: getFromCache(EXERCISE_TAB_CACHE_KEY) as 'create' | 'differentiate' | null
    };
  }, [getFromCache]);

  // Fonction pour vider le cache
  const clearExerciseCache = useCallback(() => {
    try {
      sessionStorage.removeItem(EXERCISE_FORM_CACHE_KEY);
      sessionStorage.removeItem(EXERCISE_RESULT_CACHE_KEY);
      sessionStorage.removeItem(EXERCISE_TAB_CACHE_KEY);
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    }
  }, []);

  // Fonction pour ré-essayer la sauvegarde manuellement
  const retrySaveExercise = useCallback(async (formData: ExerciseFormData, exerciseContent: string, isDifferentiation: boolean) => {
    return await saveExerciseToDatabase(formData, exerciseContent, isDifferentiation);
  }, [saveExerciseToDatabase]);

  return {
    isLoading,
    isSaving,
    lastSaveError,
    generateExercises,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise
  };
}
