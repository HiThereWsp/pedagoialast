import { useCallback } from "react";
import { useExerciseRetrieval } from "./retrieval/useExerciseRetrieval";
import { useLessonPlanRetrieval } from "./retrieval/useLessonPlanRetrieval";
import { useCorrespondenceRetrieval } from "./retrieval/useCorrespondenceRetrieval";
import { useImageRetrieval } from "./retrieval/useImageRetrieval";
import { useMusicLessonRetrieval } from "./retrieval/useMusicLessonRetrieval";
import { useRetryHandler } from "./retrieval/useRetryHandler";

/**
 * Hook pour gérer la récupération des différents types de contenu
 */
export function useContentRetrieval() {
  const { retrieveExercises, isLoadingExercises } = useExerciseRetrieval();
  const { retrieveLessonPlans, isLoadingLessonPlans } = useLessonPlanRetrieval();
  const { retrieveCorrespondences, isLoadingCorrespondences } = useCorrespondenceRetrieval();
  const { retrieveImages, isLoadingImages } = useImageRetrieval();
  const { retrieveMusicLessons, isLoadingMusicLessons } = useMusicLessonRetrieval();
  const { handleRetry } = useRetryHandler();

  // Vérifier si le composant est en chargement
  const isLoading = isLoadingExercises || isLoadingLessonPlans || isLoadingCorrespondences || isLoadingImages || isLoadingMusicLessons;

  return {
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    retrieveMusicLessons,
    handleRetry,
    isContentLoading: isLoading
  };
}
