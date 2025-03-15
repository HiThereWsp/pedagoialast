
import { useCallback } from "react";
import { useContentCache } from "./useContentCache";
import { useContentErrors } from "./useContentErrors";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook pour gérer le traitement et la mise à jour du contenu
 */
export function useContentProcessing() {
  const {
    getCachedContent,
    updateCache,
    getPendingContent,
    updatePendingContent,
    setDataReceived,
    hasDataReceived,
    invalidateCache
  } = useContentCache();
  
  const { addError, showErrorToast } = useContentErrors();

  // Fonction pour sauvegarder les données partielles
  const savePartialContent = useCallback(() => {
    const pendingContent = getPendingContent();
    if (pendingContent && pendingContent.length > 0) {
      console.log(`⚠️ Sauvegarde des ${pendingContent.length} éléments dans le cache avant annulation`);
      updateCache(pendingContent);
      setDataReceived(true);
      return true;
    }
    console.log("🛑 Annulation d'une requête en cours (aucune donnée partielle)");
    return false;
  }, [getPendingContent, updateCache, setDataReceived]);

  // Fonction pour traiter et préparer le contenu final
  const processFinalContent = useCallback((allContent: SavedContent[]): SavedContent[] => {
    if (!allContent || !Array.isArray(allContent) || allContent.length === 0) {
      return [];
    }
    
    // Trier par date de création (plus récent en premier)
    const sortedContent = allContent.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return sortedContent;
  }, []);

  // Fonction pour traiter les erreurs de récupération
  const handleFetchError = useCallback((error: unknown, requestId: number) => {
    console.error(`❌ [Requête ${requestId}] Erreur lors du chargement des contenus:`, error);
    
    if (error instanceof Error) {
      addError('images', "Une erreur est survenue lors du chargement de vos contenus");
      
      showErrorToast(
        "Erreur de chargement", 
        "Impossible de charger vos contenus. Veuillez réessayer ultérieurement."
      );
    }
  }, [addError, showErrorToast]);

  return {
    savePartialContent,
    processFinalContent,
    handleFetchError,
    getCachedContent,
    updateCache,
    getPendingContent,
    updatePendingContent,
    setDataReceived,
    hasDataReceived,
    invalidateCache
  };
}
