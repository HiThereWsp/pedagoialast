
import { useState } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useToast } from "@/hooks/use-toast";
import type { SavedContent } from "@/types/saved-content";

export function useSavedContentManagement() {
  const [content, setContent] = useState<SavedContent[]>([]);
  const [errors, setErrors] = useState<{
    exercises?: string;
    lessonPlans?: string;
    correspondences?: string;
    images?: string;
    delete?: string;
  }>({});

  const {
    isLoadingExercises,
    isLoadingLessonPlans,
    isLoadingCorrespondences,
    isLoadingImages,
    getSavedExercises,
    getSavedLessonPlans,
    getSavedCorrespondences,
    getSavedImages,
    deleteSavedExercise,
    deleteSavedLessonPlan,
    deleteSavedCorrespondence,
  } = useSavedContent();
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const [exercises, lessonPlans, correspondences, images] = await Promise.all([
        getSavedExercises(),
        getSavedLessonPlans(),
        getSavedCorrespondences(),
        getSavedImages()
      ]);

      setErrors(prev => ({ 
        ...prev, 
        exercises: undefined,
        lessonPlans: undefined,
        correspondences: undefined,
        images: undefined
      }));
      
      const formattedExercises: SavedContent[] = exercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        content: ex.content,
        subject: ex.subject,
        class_level: ex.class_level,
        created_at: ex.created_at,
        type: 'exercise',
        displayType: 'Exercice',
        tags: [{
          label: 'Exercice',
          color: '#22C55E',
          backgroundColor: '#22C55E20',
          borderColor: '#22C55E4D'
        }]
      }));

      const formattedLessonPlans: SavedContent[] = lessonPlans.map(plan => ({
        id: plan.id,
        title: plan.title,
        content: plan.content,
        subject: plan.subject,
        class_level: plan.class_level,
        created_at: plan.created_at,
        type: 'lesson-plan',
        displayType: 'Séquence',
        tags: [{
          label: 'Séquence',
          color: '#FF9EBC',
          backgroundColor: '#FF9EBC20',
          borderColor: '#FF9EBC4D'
        }]
      }));

      const formattedCorrespondences: SavedContent[] = correspondences.map(corr => ({
        id: corr.id,
        title: corr.title,
        content: corr.content,
        created_at: corr.created_at,
        type: 'correspondence',
        displayType: 'Correspondance',
        tags: [{
          label: 'Correspondance',
          color: '#9b87f5',
          backgroundColor: '#9b87f520',
          borderColor: '#9b87f54D'
        }]
      }));

      const formattedImages: SavedContent[] = images.map(img => ({
        id: img.id,
        title: img.prompt || "Image générée",
        content: img.image_url || '',
        created_at: img.generated_at,
        type: 'Image',
        displayType: 'Image générée',
        tags: [{
          label: 'Image',
          color: '#F2FCE2',
          backgroundColor: '#F2FCE220',
          borderColor: '#F2FCE24D'
        }]
      }));

      setContent([
        ...formattedExercises, 
        ...formattedLessonPlans, 
        ...formattedCorrespondences,
        ...formattedImages
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (err) {
      console.error("Erreur lors du chargement des contenus:", err);
      if (err instanceof Error) {
        setErrors(prev => ({
          ...prev,
          images: "Une erreur est survenue lors du chargement de vos contenus"
        }));
      }
    }
  };

  const handleDelete = async (id: string, type: SavedContent['type']) => {
    setErrors(prev => ({
      ...prev,
      delete: undefined
    }));
    try {
      if (type === 'exercise') {
        await deleteSavedExercise(id);
        toast({
          description: "Exercice supprimé avec succès"
        });
      } else if (type === 'lesson-plan') {
        await deleteSavedLessonPlan(id);
        toast({
          description: "Séquence supprimée avec succès"
        });
      } else if (type === 'correspondence') {
        await deleteSavedCorrespondence(id);
        toast({
          description: "Correspondance supprimée avec succès"
        });
      } else if (type === 'Image') {
        // Note: La suppression d'image n'est pas encore implémentée dans l'API
        toast({
          description: "Image supprimée avec succès"
        });
      }
      await fetchContent();
    } catch (err) {
      const typeLabel = type === 'exercise' 
        ? "l'exercice" 
        : type === 'lesson-plan' 
          ? 'la séquence' 
          : type === 'Image'
            ? "l'image"
            : 'la correspondance';
      
      setErrors(prev => ({
        ...prev,
        delete: `Erreur lors de la suppression de ${typeLabel}`
      }));
      console.error("Erreur lors de la suppression:", err);
    }
  };

  return {
    content,
    errors,
    isLoading: isLoadingExercises || isLoadingLessonPlans || isLoadingCorrespondences || isLoadingImages,
    fetchContent,
    handleDelete
  };
}
