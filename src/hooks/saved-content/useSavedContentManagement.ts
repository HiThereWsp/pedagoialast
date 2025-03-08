
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SavedContent } from "@/types/saved-content";
import { useFetchContent } from "./useFetchContent";
import { useDeleteContent } from "./useDeleteContent";
import { REQUEST_COOLDOWN } from "./constants";

export function useSavedContentManagement() {
  const [content, setContent] = useState<SavedContent[]>([]);
  const didUnmount = useRef(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { user, authReady } = useAuth();
  
  const {
    fetchContent,
    cancelFetch,
    errors: fetchErrors,
    isLoading,
    isRefreshing,
    hasLoadedData,
    cleanupImageContent
  } = useFetchContent();
  
  const {
    handleDelete,
    deleteErrors,
    setDeleteErrors
  } = useDeleteContent();

  // Nettoyer les ressources à la démonter du composant
  useEffect(() => {
    return () => {
      didUnmount.current = true;
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Annuler les requêtes en cours
      cancelFetch();
      
      // Nettoyer les ressources des hooks dépendants
      cleanupImageContent?.();
    };
  }, [cancelFetch, cleanupImageContent]);

  // Fonction pour récupérer les données avec un rafraîchissement forcé
  const refreshContent = useCallback(async (): Promise<void> => {
    if (didUnmount.current) return;
    
    try {
      const newContent = await fetchContent({ forceRefresh: true });
      if (!didUnmount.current && newContent.length > 0) {
        setContent(newContent);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du contenu:", error);
    }
  }, [fetchContent]);

  // Charge le contenu une fois l'authentification terminée
  useEffect(() => {
    if (authReady && user && !hasLoadedData.current) {
      console.log("Auth ready et utilisateur connecté, chargement des données...");
      
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          const initialContent = await fetchContent();
          if (!didUnmount.current) {
            setContent(initialContent);
          }
        } catch (error) {
          console.error("Erreur lors du chargement initial:", error);
        }
      }, REQUEST_COOLDOWN);
    }
  }, [authReady, user, fetchContent, hasLoadedData]);

  // Gestionnaire de suppression avec mise à jour de l'état local
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    const success = await handleDelete(id, type);
    
    if (success && !didUnmount.current) {
      setContent(prev => prev.filter(item => item.id !== id));
    }
  }, [handleDelete]);

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
    cleanup: cancelFetch
  };
}
