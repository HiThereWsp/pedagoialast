
import { useState, useRef, useCallback, useEffect } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useContentLoader } from "./useContentLoader";
import { useContentDeletion } from "./useContentDeletion";
import { CONTENT_UPDATE_THROTTLE } from "./constants";

export function useSavedContentManagement() {
  // État principal du contenu
  const [content, setContent] = useState<SavedContent[]>([]);
  
  // Références pour la gestion du cycle de vie et des performances
  const didUnmount = useRef(false);
  const lastContentUpdate = useRef<number>(0);
  const pendingUpdateTimeout = useRef<number | null>(null);
  const isInitialLoadComplete = useRef<boolean>(false);
  
  // Hooks dépendants pour les fonctionnalités spécifiques
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

  // Effet de nettoyage global
  useEffect(() => {
    return () => {
      didUnmount.current = true;
      
      // Nettoyer tout timeout en attente
      if (pendingUpdateTimeout.current) {
        window.clearTimeout(pendingUpdateTimeout.current);
      }
    };
  }, []);

  // Fonction utilitaire pour mettre à jour le contenu de manière optimisée
  const updateContentThrottled = useCallback((newContent: SavedContent[]) => {
    // Annuler toute mise à jour planifiée précédemment
    if (pendingUpdateTimeout.current) {
      window.clearTimeout(pendingUpdateTimeout.current);
      pendingUpdateTimeout.current = null;
    }
    
    // Comparer les contenus pour éviter les mises à jour inutiles
    const contentChanged = content.length !== newContent.length || 
      newContent.some((item, index) => content[index]?.id !== item.id);
    
    if (!contentChanged) {
      console.log("🔍 Contenu identique, mise à jour ignorée");
      return;
    }
    
    // Mettre à jour l'état avec un léger délai pour éviter les mises à jour multiples
    pendingUpdateTimeout.current = window.setTimeout(() => {
      if (!didUnmount.current) {
        console.log(`📊 Mise à jour du contenu avec ${newContent.length} éléments`);
        setContent(newContent);
        lastContentUpdate.current = Date.now();
        pendingUpdateTimeout.current = null;
      }
    }, CONTENT_UPDATE_THROTTLE);
  }, [content]);

  // Fonction optimisée pour récupérer et mettre à jour le contenu
  const fetchContent = useCallback(async (options?: { forceRefresh?: boolean }): Promise<SavedContent[]> => {
    if (didUnmount.current) return content;
    
    const forceRefresh = options?.forceRefresh || false;
    
    // Vérifier l'état d'authentification
    if (!user?.id) {
      console.warn("👤 Utilisateur non authentifié lors du chargement");
      return content;
    }
    
    try {
      console.log(`🔄 Chargement des contenus (force: ${forceRefresh})...`);
      
      // Utiliser la fonction de chargement du contenu depuis useContentLoader
      const newContent = await loadContent(forceRefresh);
      
      if (didUnmount.current) {
        console.log("⚠️ Composant démonté, mise à jour annulée");
        return content;
      }
      
      if (newContent.length > 0) {
        console.log(`✅ Chargement réussi: ${newContent.length} éléments`);
        
        // Trier les contenus par date (du plus récent au plus ancien)
        const sortedContent = [...newContent].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Mettre à jour le contenu avec la fonction optimisée
        updateContentThrottled(sortedContent);
        isInitialLoadComplete.current = true;
        
        return sortedContent;
      } else if (newContent.length === 0 && content.length > 0 && forceRefresh) {
        // Si le résultat est vide mais que nous avions du contenu avant, et c'est un rafraîchissement forcé
        console.log("⚠️ Réponse vide lors d'une actualisation forcée, conservation du contenu existant");
        return content;
      } else {
        // Pas de contenu trouvé
        console.log("ℹ️ Aucun contenu disponible");
        isInitialLoadComplete.current = true;
        
        if (content.length > 0) {
          // Vider l'état si le contenu précédent n'est plus valide
          updateContentThrottled([]);
        }
        
        return [];
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement:", error);
      
      // En cas d'erreur, conserver le contenu existant si disponible
      if (content.length > 0) {
        console.log("⚠️ Erreur de chargement, conservation du contenu existant");
        return content;
      }
      
      return [];
    }
  }, [loadContent, content, user, updateContentThrottled]);

  // Fonction optimisée pour la suppression de contenu avec mise à jour locale
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    try {
      console.log(`🗑️ Suppression du contenu ${id} de type ${type}...`);
      
      // Supprimer l'élément de l'état local avant même la réponse de l'API pour une UI réactive
      setContent(prev => prev.filter(item => item.id !== id));
      
      // Appeler l'API de suppression
      await deleteContent(id, type);
      
      if (!didUnmount.current) {
        console.log("✅ Suppression réussie");
        lastContentUpdate.current = Date.now();
        
        // Invalider le cache pour s'assurer que les données sont à jour
        invalidateCache();
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      
      // Si la suppression échoue, récupérer à nouveau les données
      if (!didUnmount.current) {
        try {
          const refreshedContent = await fetchContent({ forceRefresh: true });
          console.log(`🔄 Contenu rafraîchi après échec de suppression: ${refreshedContent.length} éléments`);
        } catch (refreshError) {
          console.error("❌ Échec également du rafraîchissement après suppression:", refreshError);
        }
      }
    }
  }, [deleteContent, invalidateCache, fetchContent]);

  // Combinaison des erreurs provenant des différents hooks
  const errors = {
    ...fetchErrors,
    ...deleteErrors
  };

  // Fonction de nettoyage complète
  const cleanupResources = useCallback(() => {
    console.log("🧹 Nettoyage complet des ressources");
    
    // Annuler les requêtes en cours
    cancelFetch();
    
    // Nettoyer les ressources d'image
    cleanupImageContent();
    
    // Annuler tout timeout de mise à jour
    if (pendingUpdateTimeout.current) {
      window.clearTimeout(pendingUpdateTimeout.current);
      pendingUpdateTimeout.current = null;
    }
    
    // Réinitialiser les erreurs de suppression
    setDeleteErrors({});
  }, [cancelFetch, cleanupImageContent, setDeleteErrors]);

  return {
    // État
    content,
    errors,
    isLoading,
    isRefreshing,
    isInitialLoadComplete: isInitialLoadComplete.current,
    
    // Actions
    fetchContent,
    handleDelete: handleContentDelete,
    cleanup: cleanupResources,
    invalidateCache,
    
    // Informations supplémentaires pour le débogage
    lastUpdateTime: lastContentUpdate.current
  };
}
