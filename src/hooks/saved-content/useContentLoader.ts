
import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SavedContent } from "@/types/saved-content";
import { useFetchContent } from "./useFetchContent";
import { REQUEST_COOLDOWN } from "./constants";

export function useContentLoader() {
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

  // Fonction optimisée pour récupérer les données
  const loadContent = useCallback(async (forceRefresh = false): Promise<SavedContent[]> => {
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors du chargement");
      return [];
    }

    try {
      console.log(`🔄 Chargement du contenu (force: ${forceRefresh})...`);
      const content = await fetchContent({ forceRefresh });
      console.log(`✅ Contenu chargé: ${content.length} éléments`);
      return content;
    } catch (error) {
      console.error("❌ Erreur lors du chargement:", error);
      return [];
    }
  }, [fetchContent, user]);

  return {
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
  };
}
