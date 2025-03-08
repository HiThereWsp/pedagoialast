
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
  const initialFetchDone = useRef(false);
  
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
      console.log("Nettoyage des ressources dans useSavedContentManagement");
      didUnmount.current = true;
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      // Annuler les requêtes en cours
      cancelFetch();
      
      // Nettoyer les ressources des hooks dépendants
      cleanupImageContent?.();
    };
  }, [cancelFetch, cleanupImageContent]);

  // Fonction pour récupérer les données avec un rafraîchissement forcé
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    try {
      console.log("Rafraîchissement forcé du contenu...");
      const newContent = await fetchContent({ forceRefresh: true });
      
      if (!didUnmount.current) {
        if (newContent.length > 0) {
          setContent(newContent);
        } else {
          console.log("Aucun nouveau contenu reçu lors du rafraîchissement");
        }
      }
      
      return newContent;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du contenu:", error);
      return [];
    }
  }, [fetchContent]);

  // Charge le contenu une fois l'authentification terminée
  useEffect(() => {
    // Éviter les appels multiples avec le même état d'authentification
    if (authReady && user && !initialFetchDone.current && !hasLoadedData.current) {
      console.log("Auth ready et utilisateur connecté, chargement des données...");
      initialFetchDone.current = true;
      
      // Utiliser un délai pour éviter les requêtes trop rapprochées
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          if (didUnmount.current) return;
          
          const initialContent = await fetchContent();
          
          if (!didUnmount.current && initialContent.length > 0) {
            console.log(`Chargement initial terminé: ${initialContent.length} éléments chargés`);
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
    if (!id || !type) {
      console.error("ID ou type manquant pour la suppression");
      return;
    }
    
    console.log(`Suppression de contenu demandée: ${id} (type: ${type})`);
    const success = await handleDelete(id, type);
    
    if (success && !didUnmount.current) {
      console.log("Suppression réussie, mise à jour du state local");
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
