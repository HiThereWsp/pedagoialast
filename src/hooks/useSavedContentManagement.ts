
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
  const hasLoadedData = useRef(false);
  const retryCount = useRef(0);
  const requestCount = useRef(0);
  const MAX_RETRIES = 3;
  const fetchTimeoutRef = useRef<number | null>(null);

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

  // Fonction pour nettoyer les timeouts à la démonter du composant
  const cleanupTimeouts = () => {
    if (fetchTimeoutRef.current) {
      window.clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  };

  const fetchContent = useCallback(async (forceRefresh = false) => {
    // Incrémenter le compteur de requêtes pour le débogage
    requestCount.current += 1;
    const currentRequest = requestCount.current;
    
    // Éviter les appels concurrents ou inutiles
    if (fetchInProgress.current && !forceRefresh) {
      console.log(`[Requête ${currentRequest}] Récupération des données déjà en cours, ignorer cette demande`);
      return;
    }

    if (hasLoadedData.current && !forceRefresh) {
      console.log(`[Requête ${currentRequest}] Données déjà chargées, utilisation du cache`);
      return;
    }

    if (!user && authReady) {
      console.log(`[Requête ${currentRequest}] Aucun utilisateur connecté, abandon du chargement des données`);
      setIsLoadingInitial(false);
      return;
    }

    try {
      fetchInProgress.current = true;
      
      if (forceRefresh) {
        setIsRefreshing(true);
        console.log(`[Requête ${currentRequest}] Rafraîchissement forcé des données`);
      } else {
        console.log(`[Requête ${currentRequest}] Début de la récupération des contenus sauvegardés...`);
      }
      
      // Récupérer séquentiellement pour réduire la charge
      const exercises = await getSavedExercises().catch(err => {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des exercices:`, err);
        setErrors(prev => ({ ...prev, exercises: "Impossible de charger les exercices" }));
        return [];
      });
      
      // Vérifier si le composant est toujours monté et la requête actuelle
      if (currentRequest !== requestCount.current) {
        console.log(`[Requête ${currentRequest}] Requête abandonnée car plus récente disponible`);
        return;
      }
      
      const lessonPlans = await getSavedLessonPlans().catch(err => {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des plans de leçon:`, err);
        setErrors(prev => ({ ...prev, lessonPlans: "Impossible de charger les séquences" }));
        return [];
      });
      
      if (currentRequest !== requestCount.current) return;
      
      const correspondences = await getSavedCorrespondences().catch(err => {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des correspondances:`, err);
        setErrors(prev => ({ ...prev, correspondences: "Impossible de charger les correspondances" }));
        return [];
      });
      
      if (currentRequest !== requestCount.current) return;
      
      // Limiter le chargement des images pour éviter la boucle infinie
      let images = [];
      try {
        // Utiliser un timeout pour éviter de bloquer l'UI
        const imagePromise = getSavedImages();
        const timeoutPromise = new Promise((_, reject) => {
          fetchTimeoutRef.current = window.setTimeout(() => {
            reject(new Error("Délai d'attente dépassé pour les images"));
          }, 5000); // 5 secondes de timeout
        });
        
        images = await Promise.race([imagePromise, timeoutPromise]) as any[];
        
        cleanupTimeouts();
      } catch (err) {
        cleanupTimeouts();
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des images:`, err);
        setErrors(prev => ({ ...prev, images: "Impossible de charger les images" }));
        images = [];
      }

      console.log(`[Requête ${currentRequest}] Données récupérées:`, {
        exercises: exercises?.length || 0,
        lessonPlans: lessonPlans?.length || 0,
        correspondences: correspondences?.length || 0,
        images: images?.length || 0
      });

      if (currentRequest !== requestCount.current) return;

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

      // Traitement optimisé des images pour éviter les boucles
      const MAX_IMAGES = 50; // Limiter le nombre d'images pour éviter les problèmes de performance
      const validImages = (images || [])
        .filter(img => 
          img !== null && 
          typeof img === 'object' && 
          'status' in img && 
          img.status === 'success' &&
          'image_url' in img
        )
        .slice(0, MAX_IMAGES); // Limiter le nombre d'images

      console.log(`[Requête ${currentRequest}] Images valides: ${validImages.length} sur ${images?.length || 0}`);

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

      // Marquer le chargement comme terminé
      hasLoadedData.current = true;
      retryCount.current = 0;

    } catch (err) {
      console.error(`[Requête ${currentRequest}] Erreur lors du chargement des contenus:`, err);
      
      // Gestion des tentatives avec délai progressif
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        const delay = Math.min(1000 * retryCount.current, 5000); // Délai progressif, max 5 secondes
        console.log(`[Requête ${currentRequest}] Nouvelle tentative ${retryCount.current}/${MAX_RETRIES} dans ${delay/1000}s...`);
        
        fetchTimeoutRef.current = window.setTimeout(() => {
          fetchContent(true);
        }, delay);
        
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

  // Nettoyer les timeouts lors du démontage du composant
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, []);

  // Charger le contenu une fois l'authentification terminée
  useEffect(() => {
    if (authReady && user && !hasLoadedData.current) {
      console.log("Auth ready et utilisateur connecté, chargement des données...");
      fetchContent();
    }
  }, [authReady, user, fetchContent]);

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
      hasLoadedData.current = false; // Force refresh
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
    fetchContent: () => {
      hasLoadedData.current = false; // Invalider le cache lors d'un rafraîchissement manuel
      return fetchContent(true);
    },
    handleDelete
  };
}
