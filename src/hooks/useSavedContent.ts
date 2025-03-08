
// Re-export and combine content hooks for centralized content management
import { useExerciseContent } from './content/useExerciseContent';
import { useLessonPlanContent } from './content/useLessonPlanContent';
import { useCorrespondenceContent } from './content/useCorrespondenceContent';
import { useImageContent } from './content/useImageContent';

/**
 * Combines all content-related hooks into a single interface
 * @returns Object containing methods and state for all content types
 */
export function useSavedContent() {
  const exerciseHook = useExerciseContent();
  const lessonPlanHook = useLessonPlanContent();
  const correspondenceHook = useCorrespondenceContent();
  const imageHook = useImageContent();

  // Fonction de nettoyage globale
  const cleanup = () => {
    if (imageHook.cleanup) {
      imageHook.cleanup();
    }
  };

  return {
    // Exercise methods and state
    isLoadingExercises: exerciseHook.isLoading,
    saveExercise: exerciseHook.saveExercise,
    getSavedExercises: exerciseHook.getSavedExercises,
    deleteSavedExercise: exerciseHook.deleteSavedExercise,
    
    // Lesson plan methods and state
    isLoadingLessonPlans: lessonPlanHook.isLoading,
    saveLessonPlan: lessonPlanHook.saveLessonPlan,
    getSavedLessonPlans: lessonPlanHook.getSavedLessonPlans,
    deleteSavedLessonPlan: lessonPlanHook.deleteSavedLessonPlan,
    
    // Correspondence methods and state
    isLoadingCorrespondences: correspondenceHook.isLoading,
    saveCorrespondence: correspondenceHook.saveCorrespondence,
    getSavedCorrespondences: correspondenceHook.getSavedCorrespondences,
    deleteSavedCorrespondence: correspondenceHook.deleteSavedCorrespondence,
    
    // Image methods and state
    isLoadingImages: imageHook.isLoading,
    saveImage: imageHook.saveImage,
    getSavedImages: imageHook.getSavedImages,
    retryFailedImage: imageHook.retryFailedImage,
    cleanup
  };
}
