
import { useCallback } from 'react';
import { useExerciseCache } from './useExerciseCache';
import { useExerciseSaving } from './useExerciseSaving';
import { useExerciseGenerator } from './useExerciseGenerator';
import type { ExerciseFormData } from '@/types/saved-content';

export function useExerciseGeneration() {
  const { 
    saveToCache, 
    clearExerciseCache, 
    getExerciseCacheState,
    CACHE_KEYS
  } = useExerciseCache();
  
  const {
    isSaving,
    lastSaveError,
    lastGeneratedId,
    saveExerciseToDatabase,
    retrySaveExercise
  } = useExerciseSaving();
  
  const {
    isLoading,
    generateExerciseContent
  } = useExerciseGenerator();

  const generateExercises = useCallback(async (
    formData: ExerciseFormData, 
    isDifferentiation: boolean = false
  ) => {
    // Nettoyage du cache AVANT la génération pour éviter la persistance
    clearExerciseCache();
    
    // Sauvegarder UNIQUEMENT le formulaire et l'onglet actif dans le cache
    saveToCache(CACHE_KEYS.FORM_CACHE_KEY, formData);
    saveToCache(CACHE_KEYS.TAB_CACHE_KEY, isDifferentiation ? 'differentiate' : 'create');
    
    // Génération du contenu de l'exercice
    const exerciseContent = await generateExerciseContent(formData, isDifferentiation);

    if (exerciseContent) {
      console.log('Exercice généré avec succès, mise en cache du résultat');
      // Sauvegarder le résultat de la génération dans le cache SEULEMENT après une génération réussie
      saveToCache(CACHE_KEYS.RESULT_CACHE_KEY, exerciseContent);
      
      // Sauvegarde en base de données avec gestion des erreurs
      await saveExerciseToDatabase(formData, exerciseContent, isDifferentiation);
    }

    return exerciseContent;
  }, [
    clearExerciseCache, 
    saveToCache, 
    CACHE_KEYS, 
    generateExerciseContent, 
    saveExerciseToDatabase
  ]);

  return {
    generateExercises,
    isLoading,
    isSaving,
    lastSaveError,
    lastGeneratedId,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise
  };
}
