
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSavedContent } from "@/hooks/useSavedContent";
import type { SavedContent } from "@/types/saved-content";
import { ContentErrors } from "./types";

export function useDeleteContent() {
  const [errors, setErrors] = useState<ContentErrors>({});
  const { toast } = useToast();
  
  const {
    deleteSavedExercise,
    deleteSavedLessonPlan,
    deleteSavedCorrespondence
  } = useSavedContent();

  const handleDelete = useCallback(async (id: string, type: SavedContent['type']) => {
    if (!id || !type) {
      console.error("ID ou type manquant pour la suppression");
      return;
    }

    setErrors(prev => ({
      ...prev,
      delete: undefined
    }));

    try {
      switch (type) {
        case 'exercise':
          await deleteSavedExercise(id);
          toast({ description: "Exercice supprimé avec succès" });
          break;
        case 'lesson-plan':
          await deleteSavedLessonPlan(id);
          toast({ description: "Séquence supprimée avec succès" });
          break;
        case 'correspondence':
          await deleteSavedCorrespondence(id);
          toast({ description: "Correspondance supprimée avec succès" });
          break;
        case 'Image':
          // Pas d'appel serveur pour les images, juste une mise à jour d'état
          toast({ description: "Image supprimée du cache local" });
          break;
        default:
          console.error("Type de contenu non reconnu:", type);
          return;
      }
      
      return true;
    } catch (err) {
      const typeLabel = {
        'exercise': "l'exercice",
        'lesson-plan': 'la séquence',
        'Image': "l'image",
        'correspondence': 'la correspondance'
      }[type] || 'le contenu';
      
      setErrors(prev => ({
        ...prev,
        delete: `Erreur lors de la suppression de ${typeLabel}`
      }));
      console.error("Erreur lors de la suppression:", err);
      return false;
    }
  }, [deleteSavedExercise, deleteSavedLessonPlan, deleteSavedCorrespondence, toast]);

  return {
    handleDelete,
    deleteErrors: errors,
    setDeleteErrors: setErrors
  };
}
