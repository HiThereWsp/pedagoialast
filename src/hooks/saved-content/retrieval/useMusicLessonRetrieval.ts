import { useState, useCallback } from "react";
import { useContentErrors } from "../useContentErrors";
import { useContentCache } from "../useContentCache";
import { musicLessonsService } from "@/services/music-lessons";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook pour récupérer les leçons en musique
 */
export function useMusicLessonRetrieval() {
  const [isLoadingMusicLessons, setIsLoadingMusicLessons] = useState(false);
  const { updateErrors, clearError } = useContentErrors();
  const { getCachedMusicLessons, updateMusicLessonsCache } = useContentCache();

  const retrieveMusicLessons = useCallback(async (
    signal: AbortSignal,
    forceRefresh = false,
    requestId?: number
  ): Promise<SavedContent[]> => {
    if (signal.aborted) {
      console.log(`🛑 [Requête ${requestId}] Récupération des leçons en musique annulée avant démarrage`);
      return [];
    }

    try {
      console.log(`🎵 [Requête ${requestId}] Début de récupération des leçons en musique...`);
      setIsLoadingMusicLessons(true);
      clearError('musicLessons');

      // Si le rafraîchissement n'est pas forcé et qu'il y a des données en cache, les utiliser
      const cachedMusicLessons = getCachedMusicLessons();
      if (!forceRefresh && cachedMusicLessons.length > 0) {
        console.log(`🎵 [Requête ${requestId}] Utilisation des leçons en musique en cache: ${cachedMusicLessons.length}`);
        return cachedMusicLessons;
      }

      // Récupérer les leçons en musique depuis le service
      const musicLessons = await musicLessonsService.getAll();
      
      if (signal.aborted) {
        console.log(`🛑 [Requête ${requestId}] Récupération des leçons en musique annulée après récupération`);
        return [];
      }

      console.log(`🎵 [Requête ${requestId}] ${musicLessons.length} leçons en musique récupérées`);
      
      // Mettre à jour le cache
      updateMusicLessonsCache(musicLessons);
      
      return musicLessons;
    } catch (error) {
      if (signal.aborted) {
        console.log(`🛑 [Requête ${requestId}] Erreur ignorée car requête annulée:`, error);
        return [];
      }

      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des leçons en musique:`, error);
      updateErrors({ 
        musicLessons: "Erreur lors de la récupération des leçons en musique" 
      });
      
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoadingMusicLessons(false);
      }
    }
  }, [clearError, getCachedMusicLessons, updateErrors, updateMusicLessonsCache]);

  return {
    retrieveMusicLessons,
    isLoadingMusicLessons
  };
} 