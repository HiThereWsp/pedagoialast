
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
      
      // Ne pas annuler les requêtes en cours si des données ont été reçues
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

  // Chargement initial des données après l'authentification - OPTIMISÉ
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
        // Forcer le rafraîchissement pour garantir les données les plus récentes
        invalidateCache(); // IMPORTANT: Toujours invalider le cache au chargement initial
        
        const initialContent = await fetchContent({ forceRefresh: true });
        
        if (!didUnmount.current) {
          console.log(`📊 Chargement initial terminé: ${initialContent.length} éléments`);
          
          // Toujours mettre à jour l'état avec les données récupérées
          setContent(initialContent);
          lastContentUpdate.current = Date.now();
          
          // Si aucun contenu au premier chargement, réessayer rapidement une fois
          if (initialContent.length === 0 && errorRetryCount.current < 2) {
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
                  setContent(retryContent);
                  lastContentUpdate.current = Date.now();
                }
              } catch (error) {
                console.error("❌ Échec du rechargement automatique:", error);
              }
            }, REQUEST_COOLDOWN); // Utiliser REQUEST_COOLDOWN sans modification pour assurer la stabilité
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement initial:", error);
      }
    };
    
    // Utiliser un délai court pour éviter les requêtes trop rapprochées
    if (authReady && user && !initialFetchDone.current) {
      console.log("⏱️ Configuration du délai pour le chargement initial");
      fetchTimeoutRef.current = setTimeout(loadInitialContent, REQUEST_COOLDOWN / 3); // Délai réduit pour plus de réactivité
    }
  }, [authReady, user, fetchContent, invalidateCache, cancelFetch]);

  // Fonction pour récupérer les données avec un rafraîchissement forcé - OPTIMISÉE
  const refreshContent = useCallback(async (): Promise<SavedContent[]> => {
    if (didUnmount.current) return [];
    
    // IMPORTANTE AMÉLIORATION: Vérifier explicitement si l'utilisateur est authentifié
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors du rafraîchissement");
      return content; // Retourner le contenu actuel
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastContentUpdate.current;
    
    try {
      console.log(`🔄 Rafraîchissement forcé du contenu (ID utilisateur: ${user.id})...`);
      // Augmenter le compteur de tentatives
      refreshAttempts.current += 1;
      
      // Si plusieurs tentatives échouent, invalider le cache pour forcer une requête fraîche
      if (refreshAttempts.current > 1) {
        console.log(`🧹 Invalidation du cache après ${refreshAttempts.current} tentatives`);
        invalidateCache();
      }
      
      // Si la dernière mise à jour est trop récente et que nous avons déjà du contenu,
      // retourner le contenu actuel sans faire de requête
      if (timeSinceLastUpdate < 800 && content.length > 0) {
        console.log(`⏱️ Dernière mise à jour trop récente (${timeSinceLastUpdate}ms), contenu existant retourné`);
        return content;
      }
      
      const newContent = await fetchContent({ forceRefresh: true });
      
      if (!didUnmount.current) {
        console.log(`✅ Rafraîchissement réussi: ${newContent.length} éléments`);
        
        // CRUCIAL: Toujours mettre à jour le state avec les données récupérées
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
  }, [fetchContent, invalidateCache, content, user]);

  // Gestionnaire de suppression avec mise à jour de l'état local - OPTIMISÉ
  const handleContentDelete = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    if (!id || !type) {
      console.error("❌ ID ou type manquant pour la suppression");
      return;
    }
    
    // AMÉLIORATION: Vérifier explicitement si l'utilisateur est authentifié
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
      
      // Après une suppression réussie, on invalide le cache pour s'assurer de la cohérence
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
