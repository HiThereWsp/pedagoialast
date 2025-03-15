
import { useCallback } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useContentCache } from "../useContentCache";
import { useContentErrors } from "../useContentErrors";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook spécialisé pour la récupération des correspondances
 */
export function useCorrespondenceRetrieval() {
  const { getSavedCorrespondences, isLoadingCorrespondences } = useSavedContent();
  const { addError, clearError } = useContentErrors();
  const { getPendingContent, updatePendingContent, setDataReceived } = useContentCache();

  // Récupérer les correspondances
  const retrieveCorrespondences = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📧 [Requête ${requestId}] Récupération des correspondances en cours...`);
        const correspondences = await getSavedCorrespondences();
        console.log(`📧 [Requête ${requestId}] Correspondances récupérées: ${correspondences.length}`);
        
        // Mettre à jour les résultats partiels
        if (correspondences.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...correspondences]);
        }
        
        clearError('correspondences');
        return correspondences;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des correspondances:`, err);
      addError('correspondences', "Impossible de charger les correspondances");
      return [];
    }
  }, [getSavedCorrespondences, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  return {
    retrieveCorrespondences,
    isLoadingCorrespondences
  };
}
