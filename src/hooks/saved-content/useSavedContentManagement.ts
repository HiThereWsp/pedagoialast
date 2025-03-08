
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
  const errorRetryCount = useRef(0);
  
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
      console.log("🧹 Nettoyage des ressources dans useSavedContentManagement");
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

  // Chargement initial des données après l'authentification
  useEffect(() => {
    const loadInitialContent = async () => {
      if (!authReady || !user || initialFetchDone.current || hasLoadedData.current) {
        console.log("📋 Vérification initiale:", {
          authReady,
          user: user ? "connecté" : "non connecté",
          initialFetchDone: initialFetchDone.current,
          hasLoadedData: hasLoadedData.current
        });
        return;
      }
      
      console.log("🔑 Authentification prête et utilisateur connecté, chargement initial des données");
      initialFetchDone.current = true;
      
      try {
        console.log("📥 Début du chargement initial...");
        const initialContent = await fetchContent();
        
        if (!didUnmount.current) {
          console.log(`📊 Chargement initial terminé: ${initialContent.length} éléments`);
          if (initialContent.length > 0) {
            console.log("✅ Mise à jour du state avec les données initiales");
            setContent(initialContent);
          } else {
            console.log("⚠️ Aucun contenu reçu lors du chargement initial");
            // Si pas de contenu au premier chargement, on réessaye une fois
            if (errorRetryCount.current === 0) {
              errorRetryCount.current++;
              console.log("🔄 Tentative de rechargement automatique...");
              // Attendre un peu plus longtemps avant de réessayer
              fetchTimeoutRef.current = setTimeout(() => {
                console.log("🔄 Exécution du rechargement automatique");
                fetchContent({ forceRefresh: true })
                  .then(retryContent => {
                    if (!didUnmount.current && retryContent.length > 0) {
                      console.log(`✅ Rechargement réussi: ${retryContent.length} éléments`);
                      setContent(retryContent);
                    }
                  })
                  .catch(error => {
                    console.error("❌ Échec du rechargement automatique:", error);
                  });
              }, REQUEST_COOLDOWN * 2);
            }
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement initial:", error);
      }
    };
    
    // Utiliser un délai pour éviter les requêtes trop rapprochées
    if (authReady && user && !initialFetchDone.current) {
      console.log("⏱️ Configuration du délai pour le chargement initial");
      fetchTimeoutRef.current = setTimeout(loadInitialContent, REQUEST_COOLDOWN);
    }
  }, [authReady, user, fetchContent, hasLoadedData]);

  // Fonction pour récupérer les données avec un rafraîchissement forcé
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    try {
      console.log("🔄 Rafraîchissement forcé du contenu...");
      const newContent = await fetchContent({ forceRefresh: true });
      
      if (!didUnmount.current) {
        if (newContent.length > 0) {
          console.log(`✅ Rafraîchissement réussi: ${newContent.length} éléments`);
          setContent(newContent);
        } else {
          console.log("⚠️ Aucun nouveau contenu reçu lors du rafraîchissement");
        }
      }
      
      return newContent;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du contenu:", error);
      return [];
    }
  }, [fetchContent]);

  // Gestionnaire de suppression avec mise à jour de l'état local
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    if (!id || !type) {
      console.error("❌ ID ou type manquant pour la suppression");
      return;
    }
    
    console.log(`🗑️ Suppression de contenu demandée: ${id} (type: ${type})`);
    const success = await handleDelete(id, type);
    
    if (success && !didUnmount.current) {
      console.log("✅ Suppression réussie, mise à jour du state local");
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
