
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
      // Cela permet de préserver le cache même si le composant est démonté temporairement
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
        // Forcer le rafraîchissement au chargement initial pour s'assurer d'avoir les données fraîches
        const initialContent = await fetchContent({ forceRefresh: true });
        
        if (!didUnmount.current) {
          console.log(`📊 Chargement initial terminé: ${initialContent.length} éléments`);
          
          // CORRECTION CRITIQUE: Toujours mettre à jour le state, même si le contenu est vide
          setContent(initialContent);
          lastContentUpdate.current = Date.now();
          
          // Si pas de contenu au premier chargement, on réessaye une fois après un délai
          if (initialContent.length === 0 && errorRetryCount.current < 2) {
            errorRetryCount.current++;
            console.log(`🔄 Tentative de rechargement automatique (${errorRetryCount.current}/2)...`);
            
            // Attendre un peu plus longtemps avant de réessayer
            fetchTimeoutRef.current = setTimeout(async () => {
              console.log("🔄 Exécution du rechargement automatique");
              try {
                // Invalider le cache pour forcer une requête fraîche
                invalidateCache();
                
                const retryContent = await fetchContent({ forceRefresh: true });
                
                if (!didUnmount.current) {
                  console.log(`✅ Rechargement réussi: ${retryContent.length} éléments`);
                  setContent(retryContent);
                  lastContentUpdate.current = Date.now();
                }
              } catch (error) {
                console.error("❌ Échec du rechargement automatique:", error);
              }
            }, REQUEST_COOLDOWN * 1.5); // Délai réduit pour permettre un chargement plus rapide
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement initial:", error);
      }
    };
    
    // Utiliser un délai pour éviter les requêtes trop rapprochées
    if (authReady && user && !initialFetchDone.current) {
      console.log("⏱️ Configuration du délai pour le chargement initial");
      fetchTimeoutRef.current = setTimeout(loadInitialContent, REQUEST_COOLDOWN / 2); // Délai réduit
    }
  }, [authReady, user, fetchContent, hasLoadedData, invalidateCache]);

  // Fonction pour récupérer les données avec un rafraîchissement forcé
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastContentUpdate.current;
    
    try {
      console.log("🔄 Rafraîchissement forcé du contenu...");
      // Augmenter le compteur de tentatives
      refreshAttempts.current += 1;
      
      // Si plusieurs tentatives échouent, invalider le cache pour forcer une requête fraîche
      if (refreshAttempts.current > 1) {
        console.log(`🧹 Invalidation du cache après ${refreshAttempts.current} tentatives`);
        invalidateCache();
      }
      
      // AJOUT: Si la dernière mise à jour est trop récente et que nous avons déjà du contenu,
      // retourner le contenu actuel sans faire de requête
      if (timeSinceLastUpdate < 1000 && content.length > 0) {
        console.log(`⏱️ Dernière mise à jour trop récente (${timeSinceLastUpdate}ms), contenu existant retourné`);
        return content;
      }
      
      const newContent = await fetchContent({ forceRefresh: true });
      
      if (!didUnmount.current) {
        console.log(`✅ Rafraîchissement réussi: ${newContent.length} éléments`);
        // CORRECTION CRITIQUE: Toujours mettre à jour le state, même si le contenu est vide
        setContent(newContent);
        lastContentUpdate.current = now;
        
        // Réinitialiser le compteur de tentatives après un succès
        if (newContent.length > 0) {
          refreshAttempts.current = 0;
        }
      }
      
      return newContent;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du contenu:", error);
      return content; // Retourner le contenu actuel en cas d'erreur
    }
  }, [fetchContent, invalidateCache, content]);

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
      lastContentUpdate.current = Date.now();
      
      // Après une suppression réussie, on invalide le cache pour s'assurer de la cohérence
      invalidateCache();
    }
  }, [handleDelete, invalidateCache]);

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
