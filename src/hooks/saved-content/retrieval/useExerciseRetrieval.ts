
import { useCallback } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useContentCache } from "../useContentCache";
import { useContentErrors } from "../useContentErrors";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook spécialisé pour la récupération des exercices
 */
export function useExerciseRetrieval() {
  const { getSavedExercises, isLoadingExercises } = useSavedContent();
  const { addError, clearError } = useContentErrors();
  const { getPendingContent, updatePendingContent, setDataReceived } = useContentCache();

  // Récupérer les exercices
  const retrieveExercises = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📚 [Requête ${requestId}] Récupération des exercices en cours...`);
        const exercises = await getSavedExercises();
        console.log(`📚 [Requête ${requestId}] Exercices récupérés: ${exercises.length}`);
        
        // Marquer que des données ont été reçues
        if (exercises.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...exercises]);
        }
        
        clearError('exercises');
        return exercises;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des exercices:`, err);
      addError('exercises', "Impossible de charger les exercices");
      return [];
    }
  }, [getSavedExercises, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  return {
    retrieveExercises,
    isLoadingExercises
  };
}
