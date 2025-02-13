
import { useState, useCallback } from 'react';
import { type SavedContent } from '@/types/saved-content';
import { useSavedContent } from '@/hooks/useSavedContent';
import { useToast } from '@/hooks/use-toast';

export const useContentManagement = () => {
  const [content, setContent] = useState<SavedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [errors, setErrors] = useState<{
    exercises?: string;
    lessonPlans?: string;
    delete?: string;
  }>({});

  const {
    isLoadingExercises,
    isLoadingLessonPlans,
    getSavedExercises,
    getSavedLessonPlans,
    deleteSavedExercise,
    deleteSavedLessonPlan
  } = useSavedContent();

  const { toast } = useToast();

  const fetchContent = useCallback(async () => {
    try {
      const exercises = await getSavedExercises();
      const lessonPlans = await getSavedLessonPlans();

      setErrors(prev => ({
        ...prev,
        exercises: undefined,
        lessonPlans: undefined
      }));

      const formattedExercises = exercises.map(ex => ({
        ...ex,
        type: 'Exercice',
        description: ex.content.substring(0, 100) + '...'
      }));

      const formattedLessonPlans = lessonPlans.map(plan => ({
        ...plan,
        type: 'Séquence',
        description: plan.content.substring(0, 100) + '...'
      }));

      setContent([...formattedExercises, ...formattedLessonPlans]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error("Erreur lors du chargement des contenus:", err);
      if (err instanceof Error) {
        setErrors(prev => ({
          ...prev,
          exercises: "Une erreur est survenue lors du chargement de vos contenus"
        }));
      }
    }
  }, [getSavedExercises, getSavedLessonPlans]);

  const handleDelete = useCallback(async (id: string, type: string) => {
    setErrors(prev => ({ ...prev, delete: undefined }));
    try {
      if (type === 'Exercice') {
        await deleteSavedExercise(id);
      } else {
        await deleteSavedLessonPlan(id);
      }
      toast({
        description: `${type} supprimé avec succès`
      });
      await fetchContent();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        delete: `Erreur lors de la suppression du ${type.toLowerCase()}`
      }));
      console.error("Erreur lors de la suppression:", err);
    }
  }, [deleteSavedExercise, deleteSavedLessonPlan, toast, fetchContent]);

  return {
    content,
    selectedContent,
    setSelectedContent,
    errors,
    isLoading: isLoadingExercises || isLoadingLessonPlans,
    fetchContent,
    handleDelete
  };
};
