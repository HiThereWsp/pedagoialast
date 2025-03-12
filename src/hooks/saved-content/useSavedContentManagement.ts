
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
  const refreshAttempts = useRef(0);
  const lastContentUpdate = useRef<number>(0);
  
  const { user, authReady } = useAuth();
  
  const {
    fetchContent,
    cancelFetch,
    invalidateCache,
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
      
      // CORRECTION: Ne pas annuler les requêtes en cours si des données ont été reçues
      if (!hasLoadedData.current) {
        console.log("🛑 Annulation des requêtes en cours (aucune donnée reçue)");
        cancelFetch();
      } else {
        console.log("✅ Préservation du cache lors du démontage (données déjà reçues)");
      }
      
      // Nettoyer les ressources des hooks dépendants
      cleanupImageContent?.();
    };
  }, [cancelFetch, cleanupImageContent, hasLoadedData]);

  // CORRECTION CRITIQUE: Chargement initial des données après l'authentification
  useEffect(() => {
    const loadInitialContent = async () => {
      // Vérification préalable pour éviter les requêtes inutiles
      if (!authReady || !user || initialFetchDone.current) {
        console.log("📋 Vérification initiale:", {
          authReady,
          user: user ? "connecté" : "non connecté",
          initialFetchDone: initialFetchDone.current
        });
        return;
      }
      
      // IMPORTANTE AMÉLIORATION: Vérifier explicitement si l'utilisateur est authentifié
      if (!user.id) {
        console.error("❌ ID utilisateur non disponible, abandon du chargement");
        return;
      }
      
      console.log(`🔑 Authentification prête et utilisateur connecté (ID: ${user.id}), chargement initial`);
      initialFetchDone.current = true;
      
      try {
        console.log("📥 Début du chargement initial...");
        // CORRECTION IMPORTANTE: Forcer le rafraîchissement et invalider le cache
        invalidateCache();
        
        const initialContent = await fetchContent({ forceRefresh: true });
        
        if (!didUnmount.current) {
          console.log(`📊 Chargement initial terminé: ${initialContent.length} éléments`);
          
          // CORRECTION CRITIQUE: Mise à jour synchrone
          if (initialContent.length > 0) {
            console.log("✅ Mise à jour de l'état avec données initiales");
            setContent(initialContent);
            lastContentUpdate.current = Date.now();
          } else if (errorRetryCount.current < 2) {
            errorRetryCount.current++;
            console.log(`🔄 Tentative de rechargement automatique (${errorRetryCount.current}/2)...`);
            
            // Attendre un délai minimal avant de réessayer
            fetchTimeoutRef.current = setTimeout(async () => {
              console.log("🔄 Exécution du rechargement automatique");
              try {
                // Invalider le cache pour forcer une requête fraîche
                invalidateCache();
                
                const retryContent = await fetchContent({ forceRefresh: true });
                
                if (!didUnmount.current) {
                  console.log(`✅ Rechargement réussi: ${retryContent.length} éléments`);
                  if (retryContent.length > 0) {
                    setContent(retryContent);
                    lastContentUpdate.current = Date.now();
                  }
                }
              } catch (error) {
                console.error("❌ Échec du rechargement automatique:", error);
              }
            }, REQUEST_COOLDOWN / 2); // Délai réduit pour plus de réactivité
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement initial:", error);
      }
    };
    
    // CORRECTION IMPORTANTE: Réduire le délai pour une réactivité immédiate
    if (authReady && user && !initialFetchDone.current) {
      console.log("⏱️ Configuration du délai pour le chargement initial");
      fetchTimeoutRef.current = setTimeout(loadInitialContent, REQUEST_COOLDOWN / 4);
    }
  }, [authReady, user, fetchContent, invalidateCache, cancelFetch]);

  // CORRECTION CRITIQUE: Fonction optimisée pour récupérer les données
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors du rafraîchissement");
      return content;
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastContentUpdate.current;
    
    try {
      console.log(`🔄 Rafraîchissement forcé du contenu (ID utilisateur: ${user.id})...`);
      // Augmenter le compteur de tentatives
      refreshAttempts.current += 1;
      
      // Si plusieurs tentatives échouent, invalider le cache
      if (refreshAttempts.current > 1) {
        console.log(`🧹 Invalidation du cache après ${refreshAttempts.current} tentatives`);
        invalidateCache();
      }
      
      // Si la dernière mise à jour est trop récente et que nous avons déjà du contenu,
      // retourner le contenu actuel sans faire de requête
      if (timeSinceLastUpdate < 600 && content.length > 0) {
        console.log(`⏱️ Dernière mise à jour trop récente (${timeSinceLastUpdate}ms), contenu existant retourné`);
        return content;
      }
      
      // CORRECTION CRITIQUE: Forcer toujours un rafraîchissement
      const newContent = await fetchContent({ forceRefresh: true });
      
      if (!didUnmount.current) {
        console.log(`✅ Rafraîchissement réussi: ${newContent.length} éléments`);
        
        // CRUCIAL: Mettre à jour immédiatement l'état avec les données récupérées
        if (newContent.length > 0) {
          setContent(newContent);
          lastContentUpdate.current = now;
        }
        
        // Réinitialiser le compteur de tentatives après un succès
        if (newContent.length > 0) {
          refreshAttempts.current = 0;
        }
      }
      
      return newContent;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du contenu:", error);
      return content;
    }
  }, [fetchContent, invalidateCache, content, user]);

  // Gestionnaire de suppression avec mise à jour de l'état local
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    if (!id || !type) {
      console.error("❌ ID ou type manquant pour la suppression");
      return;
    }
    
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors de la suppression");
      return;
    }
    
    console.log(`🗑️ Suppression de contenu demandée: ${id} (type: ${type}, utilisateur: ${user.id})`);
    const success = await handleDelete(id, type);
    
    if (success && !didUnmount.current) {
      console.log("✅ Suppression réussie, mise à jour du state local");
      setContent(prev => prev.filter(item => item.id !== id));
      lastContentUpdate.current = Date.now();
      
      // Après une suppression réussie, on invalide le cache
      invalidateCache();
    }
  }, [handleDelete, invalidateCache, user]);

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
