
import { useState, useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useContentLoader } from "./useContentLoader";
import { useContentDeletion } from "./useContentDeletion";

export function useSavedContentManagement() {
  const [content, setContent] = useState<SavedContent[]>([]);
  const didUnmount = useRef(false);
  const lastContentUpdate = useRef<number>(0);
  
  const {
    loadContent,
    cancelFetch,
    invalidateCache,
    fetchErrors,
    isLoading,
    isRefreshing,
    hasLoadedData,
    cleanupImageContent,
    authReady,
    user
  } = useContentLoader();

  const {
    deleteContent,
    deleteErrors,
    setDeleteErrors
  } = useContentDeletion();

  // Fonction de rafraîchissement optimisée
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    if (!user?.id) {
      console.error("❌ Utilisateur non authentifié lors du rafraîchissement");
      return content;
    }
    
    try {
      const newContent = await loadContent(true);
      
      if (!didUnmount.current && newContent.length > 0) {
        console.log(`✅ Rafraîchissement réussi: ${newContent.length} éléments`);
        setContent(newContent);
        lastContentUpdate.current = Date.now();
      }
      
      return newContent;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement:", error);
      return content;
    }
  }, [loadContent, content, user]);

  // Gestionnaire de suppression avec mise à jour de l'état local
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    try {
      await deleteContent(id, type);
      if (!didUnmount.current) {
        console.log("✅ Suppression réussie, mise à jour du state local");
        setContent(prev => prev.filter(item => item.id !== id));
        lastContentUpdate.current = Date.now();
        invalidateCache();
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
    }
  }, [deleteContent, invalidateCache]);

  // Combiner les erreurs des différents hooks
  const errors = {
    ...fetchErrors,
    ...deleteErrors
  };

  return {
    content,
    errors,
    isLoading,
    isRefreshing,
    fetchContent: refreshContent,
    handleDelete: handleContentDelete,
    cleanup: cancelFetch,
    invalidateCache
  };
}
