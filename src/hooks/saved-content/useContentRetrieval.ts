
import { useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useContentCache } from "./useContentCache";
import { useRequestStatus } from "./useRequestStatus";
import { useContentErrors } from "./useContentErrors";
import { useSavedContent } from "@/hooks/useSavedContent";
import { MAX_RETRIES, RETRY_DELAY_BASE, MAX_RETRY_DELAY } from "./constants";

/**
 * Hook pour gérer la récupération des différents types de contenu
 */
export function useContentRetrieval() {
  const {
    isLoadingExercises,
    isLoadingLessonPlans,
    isLoadingCorrespondences,
    isLoadingImages,
    getSavedExercises,
    getSavedLessonPlans,
    getSavedCorrespondences,
    getSavedImages
  } = useSavedContent();

  const { addError, clearError } = useContentErrors();
  const { getPendingContent, updatePendingContent, setDataReceived } = useContentCache();
  const { getRetryCount } = useRequestStatus();

  // Récupérer les exercices
  const retrieveExercises = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📚 [Requête ${requestId}] Récupération des exercices en cours...`);
        const exercises = await getSavedExercises();
        console.log(`📚 [Requête ${requestId}] Exercices récupérés: ${exercises.length}`);
        
        // Marquer que des données ont été reçues
        if (exercises.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...exercises]);
        }
        
        clearError('exercises');
        return exercises;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des exercices:`, err);
      addError('exercises', "Impossible de charger les exercices");
      return [];
    }
  }, [getSavedExercises, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  // Récupérer les plans de leçon
  const retrieveLessonPlans = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📝 [Requête ${requestId}] Récupération des séquences en cours...`);
        const lessonPlans = await getSavedLessonPlans();
        console.log(`📝 [Requête ${requestId}] Séquences récupérées: ${lessonPlans.length}`);
        
        // Mettre à jour les résultats partiels
        if (lessonPlans.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...lessonPlans]);
        }
        
        clearError('lessonPlans');
        return lessonPlans;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des séquences:`, err);
      addError('lessonPlans', "Impossible de charger les séquences");
      return [];
    }
  }, [getSavedLessonPlans, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  // Récupérer les correspondances
  const retrieveCorrespondences = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`📧 [Requête ${requestId}] Récupération des correspondances en cours...`);
        const correspondences = await getSavedCorrespondences();
        console.log(`📧 [Requête ${requestId}] Correspondances récupérées: ${correspondences.length}`);
        
        // Mettre à jour les résultats partiels
        if (correspondences.length > 0) {
          setDataReceived(true);
          const pendingContent = getPendingContent() || [];
          updatePendingContent([...pendingContent, ...correspondences]);
        }
        
        clearError('correspondences');
        return correspondences;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des correspondances:`, err);
      addError('correspondences', "Impossible de charger les correspondances");
      return [];
    }
  }, [getSavedCorrespondences, addError, clearError, getPendingContent, updatePendingContent, setDataReceived]);

  // Récupérer les images
  const retrieveImages = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`🖼️ [Requête ${requestId}] Récupération des images en cours...`);
        // Passer forceRefresh pour garantir des données fraîches si nécessaire
        const imageData = await getSavedImages(forceRefresh);
        console.log(`🖼️ [Requête ${requestId}] Images récupérées: ${imageData.length}`);
        
        // Transformer les données d'image en format SavedContent
        const images = imageData.map(img => ({
          id: img.id,
          title: "Image générée",
          content: img.image_url || '',
          created_at: img.generated_at || new Date().toISOString(),
          type: 'Image',
          displayType: 'Image générée',
          tags: [{
            label: 'Image',
            color: '#F2FCE2',
            backgroundColor: '#F2FCE220',
            borderColor: '#F2FCE24D'
          }]
        }));

        if (images.length > 0) {
          setDataReceived(true);
        }
        
        clearError('images');
        return images;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des images:`, err);
      addError('images', "Impossible de charger les images");
      return [];
    }
  }, [getSavedImages, addError, clearError, setDataReceived]);

  // Méthode pour gérer une tentative avec délai progressif
  const handleRetry = useCallback(async (forceRefresh: boolean, signal: AbortSignal): Promise<boolean> => {
    const retryCount = getRetryCount();
    
    if (retryCount < MAX_RETRIES && forceRefresh && !signal.aborted) {
      const delay = Math.min(RETRY_DELAY_BASE * retryCount, MAX_RETRY_DELAY);
      console.log(`🔄 Nouvelle tentative ${retryCount}/${MAX_RETRIES} dans ${delay/1000}s...`);
      
      await new Promise(r => setTimeout(r, delay));
      return !signal.aborted;
    }
    
    return false;
  }, [getRetryCount]);

  // Vérifier si le composant est en chargement
  const isLoading = isLoadingExercises || isLoadingLessonPlans || isLoadingCorrespondences || isLoadingImages;

  return {
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    handleRetry,
    isContentLoading: isLoading
  };
}
