
import { useState, useEffect, useRef, useCallback } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchInProgress = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

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
  const { user, authReady } = useAuth();

  const fetchContent = useCallback(async (forceRefresh = false) => {
    // Éviter les appels concurrents
    if (fetchInProgress.current && !forceRefresh) {
      console.log("Récupération des données déjà en cours, ignorer cette demande");
      return;
    }

    if (!user && authReady) {
      console.log("Aucun utilisateur connecté, abandon du chargement des données");
      setIsLoadingInitial(false);
      return;
    }

    try {
      fetchInProgress.current = true;
      
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      console.log("Début de la récupération des contenus sauvegardés...");
      
      const [exercises, lessonPlans, correspondences, images] = await Promise.all([
        getSavedExercises().catch(err => {
          console.error("Erreur lors de la récupération des exercices:", err);
          setErrors(prev => ({ ...prev, exercises: "Impossible de charger les exercices" }));
          return [];
        }),
        getSavedLessonPlans().catch(err => {
          console.error("Erreur lors de la récupération des plans de leçon:", err);
          setErrors(prev => ({ ...prev, lessonPlans: "Impossible de charger les séquences" }));
          return [];
        }),
        getSavedCorrespondences().catch(err => {
          console.error("Erreur lors de la récupération des correspondances:", err);
          setErrors(prev => ({ ...prev, correspondences: "Impossible de charger les correspondances" }));
          return [];
        }),
        getSavedImages().catch(err => {
          console.error("Erreur lors de la récupération des images:", err);
          setErrors(prev => ({ ...prev, images: "Impossible de charger les images" }));
          return [];
        })
      ]);

      console.log("Données récupérées:", {
        exercises: exercises?.length || 0,
        lessonPlans: lessonPlans?.length || 0,
        correspondences: correspondences?.length || 0,
        images: images?.length || 0
      });

      setErrors(prev => ({ 
        ...prev, 
        exercises: undefined,
        lessonPlans: undefined,
        correspondences: undefined,
        images: undefined
      }));
      
      const formattedExercises: SavedContent[] = (exercises || []).map(ex => ({
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

      const formattedLessonPlans: SavedContent[] = (lessonPlans || []).map(plan => ({
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

      const formattedCorrespondences: SavedContent[] = (correspondences || []).map(corr => ({
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

      const validImages = (images || []).filter((img) => 
        img !== null && 
        typeof img === 'object' && 
        'status' in img && 
        img.status === 'success' &&
        'image_url' in img
      );

      const formattedImages: SavedContent[] = validImages.map(img => ({
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

      const allContent = [
        ...formattedExercises, 
        ...formattedLessonPlans, 
        ...formattedCorrespondences,
        ...formattedImages
      ].filter(Boolean);

      setContent(allContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Réinitialiser le compteur de tentatives en cas de succès
      retryCount.current = 0;

    } catch (err) {
      console.error("Erreur lors du chargement des contenus:", err);
      
      // Gestion des tentatives
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        console.log(`Nouvelle tentative ${retryCount.current}/${MAX_RETRIES} dans 1 seconde...`);
        
        // Attendre un peu avant de réessayer
        setTimeout(() => {
          fetchContent(true);
        }, 1000);
        
        return;
      }
      
      if (err instanceof Error) {
        setErrors(prev => ({
          ...prev,
          images: "Une erreur est survenue lors du chargement de vos contenus"
        }));
        
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos contenus. Veuillez réessayer ultérieurement."
        });
      }
    } finally {
      fetchInProgress.current = false;
      setIsLoadingInitial(false);
      setIsRefreshing(false);
    }
  }, [getSavedExercises, getSavedLessonPlans, getSavedCorrespondences, getSavedImages, toast, user, authReady]);

  // Charger le contenu une fois l'authentification terminée
  useEffect(() => {
    if (authReady) {
      console.log("Auth ready, chargement des données...");
      fetchContent();
    }
  }, [authReady, fetchContent]);

  const handleDelete = async (id: string, type: SavedContent['type']) => {
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
          // Note: La suppression d'image n'est pas encore implémentée dans l'API
          toast({ description: "Image supprimée avec succès" });
          break;
        default:
          console.error("Type de contenu non reconnu:", type);
          return;
      }
      
      // Mettre à jour le contenu après la suppression
      await fetchContent(true);
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
    }
  };

  return {
    content,
    errors,
    isLoading: isLoadingInitial || isLoadingExercises || isLoadingLessonPlans || isLoadingCorrespondences || isLoadingImages,
    isRefreshing,
    fetchContent: () => fetchContent(true), // Force refresh when called manually
    handleDelete
  };
}
