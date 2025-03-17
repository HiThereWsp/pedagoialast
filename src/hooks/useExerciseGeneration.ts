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
const EXERCISE_CACHE_TIMESTAMP = 'pedagogia_exercise_cache_timestamp';

export function useExerciseGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveExercise } = useExerciseContent();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [lastGeneratedId, setLastGeneratedId] = useState<string | undefined>(undefined);

  // Fonction utilitaire pour sauvegarder dans sessionStorage
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      // Mise à jour du timestamp pour le suivi de fraîcheur du cache
      sessionStorage.setItem(EXERCISE_CACHE_TIMESTAMP, Date.now().toString());
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

  // Fonction pour vider le cache avant génération
  const clearExerciseCache = useCallback(() => {
    console.log('Nettoyage du cache des exercices...');
    try {
      sessionStorage.removeItem(EXERCISE_FORM_CACHE_KEY);
      sessionStorage.removeItem(EXERCISE_RESULT_CACHE_KEY);
      // On garde l'onglet actif pour l'expérience utilisateur
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
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

      const result = await saveExercise({
        title,
        content: exerciseContent,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType,
        source_lesson_plan_id: formData.selectedLessonPlan || undefined,
        source_type: formData.selectedLessonPlan ? 'from_lesson_plan' : 'direct',
        exercise_category
      });
      
      // Fixed handling of possibly null result
      if (result) {
        if ('error' in result && result.error) {
          console.error('Error saving exercise:', result.error);
          setLastSaveError(result.error.message || 'Unknown error');
          toast({
            variant: "destructive",
            description: "Une erreur est survenue lors de la sauvegarde de l'exercice. Réessayez ultérieurement."
          });
          return false;
        }
        
        // Save the ID of the generated exercise if it exists
        if ('data' in result && result.data?.id) {
          setLastGeneratedId(result.data.id);
        }
      }

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

    // Nettoyage du cache AVANT la génération pour éviter la persistance
    clearExerciseCache();
    
    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Sauvegarder UNIQUEMENT le formulaire et l'onglet actif dans le cache
      saveToCache(EXERCISE_FORM_CACHE_KEY, formData);
      saveToCache(EXERCISE_TAB_CACHE_KEY, isDifferentiation ? 'differentiate' : 'create');
      
      console.log('Génération d\'exercice avec les données:', {
        sujet: formData.subject,
        niveau: formData.classLevel,
        differentiation: isDifferentiation
      });
      
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
      // SEULEMENT après une génération réussie
      if (functionData?.exercises) {
        console.log('Exercice généré avec succès, mise en cache du résultat');
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
  }, [toast, logToolUsage, saveToCache, saveExerciseToDatabase, clearExerciseCache]);

  // Fonction pour récupérer l'état du cache avec validation
  const getExerciseCacheState = useCallback(() => {
    // Récupération du timestamp pour vérifier la fraîcheur
    const cacheTimestamp = sessionStorage.getItem(EXERCISE_CACHE_TIMESTAMP);
    const isRecentCache = cacheTimestamp && (Date.now() - Number(cacheTimestamp) < 3600000); // 1 heure max
    
    if (!isRecentCache) {
      console.log('Cache trop ancien ou inexistant, retour de valeurs fraîches');
      return {
        formData: null,
        exerciseResult: null,
        activeTab: getFromCache(EXERCISE_TAB_CACHE_KEY) as 'create' | 'differentiate' | null
      };
    }
    
    return {
      formData: getFromCache(EXERCISE_FORM_CACHE_KEY) as ExerciseFormData | null,
      exerciseResult: getFromCache(EXERCISE_RESULT_CACHE_KEY) as string | null,
      activeTab: getFromCache(EXERCISE_TAB_CACHE_KEY) as 'create' | 'differentiate' | null
    };
  }, [getFromCache]);

  // Fonction pour ré-essayer la sauvegarde manuellement
  const retrySaveExercise = useCallback(async (formData: ExerciseFormData, exerciseContent: string, isDifferentiation: boolean) => {
    return await saveExerciseToDatabase(formData, exerciseContent, isDifferentiation);
  }, [saveExerciseToDatabase]);

  return {
    isLoading,
    isSaving,
    lastSaveError,
    lastGeneratedId,
    generateExercises,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise
  };
}
