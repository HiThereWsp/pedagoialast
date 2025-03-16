
import { useCallback } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useContentCache } from "../useContentCache";
import { useContentErrors } from "../useContentErrors";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook spécialisé pour la récupération des plans de leçon
 */
export function useLessonPlanRetrieval() {
  const { getSavedLessonPlans, isLoadingLessonPlans } = useSavedContent();
  const { addError, clearError } = useContentErrors();
  const { getPendingContent, updatePendingContent, setDataReceived } = useContentCache();

  // Récupérer les plans de leçon
  const retrieveLessonPlans = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📝 [Requête ${requestId}] Récupération des séquences en cours...`);
        const lessonPlans = await getSavedLessonPlans();
        console.log(`📝 [Requête ${requestId}] Séquences récupérées: ${lessonPlans.length}`);
        
        // Mettre à jour les résultats partiels
        if (lessonPlans.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...lessonPlans]);
        }
        
        clearError('lessonPlans');
        return lessonPlans;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des séquences:`, err);
      addError('lessonPlans', "Impossible de charger les séquences");
      return [];
    }
  }, [getSavedLessonPlans, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  return {
    retrieveLessonPlans,
    isLoadingLessonPlans
  };
}
