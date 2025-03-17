
import { useCallback } from 'react';

type CacheKeys = {
  FORM_CACHE_KEY: string;
  RESULT_CACHE_KEY: string;
  TAB_CACHE_KEY: string;
  CACHE_TIMESTAMP: string;
};

export const CACHE_KEYS: CacheKeys = {
  FORM_CACHE_KEY: 'pedagogia_exercise_form_data',
  RESULT_CACHE_KEY: 'pedagogia_exercise_result',
  TAB_CACHE_KEY: 'pedagogia_exercise_active_tab',
  CACHE_TIMESTAMP: 'pedagogia_exercise_cache_timestamp'
};

export function useExerciseCache() {
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      // Mise à jour du timestamp pour le suivi de fraîcheur du cache
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde dans le cache:', error);
      // En cas d'erreur (ex: mode navigation privée), on continue silencieusement
    }
  }, []);

  const getFromCache = useCallback((key: string) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Erreur lors de la récupération depuis le cache:', error);
      return null;
    }
  }, []);

  const clearExerciseCache = useCallback(() => {
    console.log('Nettoyage du cache des exercices...');
    try {
      sessionStorage.removeItem(CACHE_KEYS.FORM_CACHE_KEY);
      sessionStorage.removeItem(CACHE_KEYS.RESULT_CACHE_KEY);
      // On garde l'onglet actif pour l'expérience utilisateur
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    }
  }, []);

  const getExerciseCacheState = useCallback(() => {
    // Récupération du timestamp pour vérifier la fraîcheur
    const cacheTimestamp = sessionStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    const isRecentCache = cacheTimestamp && (Date.now() - Number(cacheTimestamp) < 3600000); // 1 heure max
    
    if (!isRecentCache) {
      console.log('Cache trop ancien ou inexistant, retour de valeurs fraîches');
      return {
        formData: null,
        exerciseResult: null,
        activeTab: getFromCache(CACHE_KEYS.TAB_CACHE_KEY) as 'create' | 'differentiate' | null
      };
    }
    
    return {
      formData: getFromCache(CACHE_KEYS.FORM_CACHE_KEY),
      exerciseResult: getFromCache(CACHE_KEYS.RESULT_CACHE_KEY),
      activeTab: getFromCache(CACHE_KEYS.TAB_CACHE_KEY) as 'create' | 'differentiate' | null
    };
  }, [getFromCache]);

  return {
    saveToCache,
    getFromCache,
    clearExerciseCache,
    getExerciseCacheState,
    CACHE_KEYS
  };
}
