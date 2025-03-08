
import { useExerciseContent } from './content/useExerciseContent';
import { useLessonPlanContent } from './content/useLessonPlanContent';
import { useCorrespondenceContent } from './content/useCorrespondenceContent';
import { useImageContent } from './content/useImageContent';

export function useSavedContent() {
  const {
    isLoading: isLoadingExercises,
    saveExercise,
    getSavedExercises,
    deleteSavedExercise
  } = useExerciseContent();

  const {
    isLoading: isLoadingLessonPlans,
    saveLessonPlan,
    getSavedLessonPlans,
    deleteSavedLessonPlan
  } = useLessonPlanContent();

  const {
    isLoading: isLoadingCorrespondences,
    saveCorrespondence,
    getSavedCorrespondences,
    deleteSavedCorrespondence
  } = useCorrespondenceContent();

  const {
    isLoading: isLoadingImages,
    saveImage,
    getSavedImages,
    retryFailedImage,
    cleanup: cleanupImageContent
  } = useImageContent();

  // Fonction de nettoyage globale
  const cleanup = () => {
    if (cleanupImageContent) {
      cleanupImageContent();
    }
  };

  return {
    isLoadingExercises,
    isLoadingLessonPlans,
    isLoadingCorrespondences,
    isLoadingImages,
    saveExercise,
    saveLessonPlan,
    saveCorrespondence,
    saveImage,
    getSavedExercises,
    getSavedLessonPlans,
    getSavedCorrespondences,
    getSavedImages,
    deleteSavedExercise,
    deleteSavedLessonPlan,
    deleteSavedCorrespondence,
    retryFailedImage,
    cleanup
  };
}
