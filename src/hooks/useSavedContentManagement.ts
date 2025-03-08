
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
  const didUnmount = useRef(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
    cleanup: cleanupImageContent
  } = useSavedContent();
  
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  // Nettoyer les ressources à la démonter du composant
  useEffect(() => {
    return () => {
      didUnmount.current = true;
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Nettoyer les ressources des hooks dépendants
      cleanupImageContent?.();
    };
  }, [cleanupImageContent]);

  const cancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    // Réinitialiser l'état de chargement
    fetchInProgress.current = false;
  }, []);

  const fetchContent = useCallback(async (forceRefresh = false) => {
    // Annuler toute requête en cours
    cancelFetch();
    
    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    
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
      
      // Ajouter un délai pour éviter les requêtes trop rapprochées
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Vérifier si le composant est toujours monté et si la requête n'a pas été annulée
      if (didUnmount.current || abortControllerRef.current?.signal.aborted) {
        console.log(`[Requête ${currentRequest}] Requête annulée ou composant démonté, abandon`);
        return;
      }
      
      // Récupérer les données de manière séquentielle pour éviter les problèmes de charge
      let exercises: SavedContent[] = [];
      let lessonPlans: SavedContent[] = [];
      let correspondences: SavedContent[] = [];
      let images: SavedContent[] = [];
      
      // 1. Récupérer les exercices
      try {
        exercises = await getSavedExercises();
        if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des exercices:`, err);
        setErrors(prev => ({ ...prev, exercises: "Impossible de charger les exercices" }));
      }
      
      // 2. Récupérer les plans de leçon
      try {
        lessonPlans = await getSavedLessonPlans();
        if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des plans de leçon:`, err);
        setErrors(prev => ({ ...prev, lessonPlans: "Impossible de charger les séquences" }));
      }
      
      // 3. Récupérer les correspondances
      try {
        correspondences = await getSavedCorrespondences();
        if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des correspondances:`, err);
        setErrors(prev => ({ ...prev, correspondences: "Impossible de charger les correspondances" }));
      }
      
      // 4. Récupérer les images
      try {
        // Passer forceRefresh pour garantir des données fraîches si nécessaire
        const imageData = await getSavedImages(forceRefresh);
        
        if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;
        
        // Transformer les données d'image en format SavedContent
        images = imageData.map(img => ({
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
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des images:`, err);
        setErrors(prev => ({ ...prev, images: "Impossible de charger les images" }));
      }
      
      // Vérifier si le composant est toujours monté
      if (didUnmount.current || abortControllerRef.current?.signal.aborted) {
        console.log(`[Requête ${currentRequest}] Composant démonté ou requête annulée, abandon du traitement des données`);
        return;
      }

      console.log(`[Requête ${currentRequest}] Données récupérées:`, {
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
      
      // Combiner toutes les données et les trier par date
      const allContent = [
        ...exercises, 
        ...lessonPlans, 
        ...correspondences,
        ...images
      ].filter(Boolean);

      if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;

      setContent(allContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Marquer le chargement comme terminé
      hasLoadedData.current = true;
      retryCount.current = 0;

    } catch (err) {
      console.error(`[Requête ${currentRequest}] Erreur lors du chargement des contenus:`, err);
      
      if (didUnmount.current || abortControllerRef.current?.signal.aborted) return;

      // Gestion des tentatives avec délai progressif
      if (retryCount.current < MAX_RETRIES && forceRefresh) {
        retryCount.current += 1;
        const delay = Math.min(1000 * retryCount.current, 5000); // Délai progressif, max 5 secondes
        console.log(`[Requête ${currentRequest}] Nouvelle tentative ${retryCount.current}/${MAX_RETRIES} dans ${delay/1000}s...`);
        
        fetchTimeoutRef.current = setTimeout(() => {
          if (!didUnmount.current && !abortControllerRef.current?.signal.aborted) {
            fetchContent(true);
          }
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
      if (!didUnmount.current) {
        setIsLoadingInitial(false);
        setIsRefreshing(false);
      }
      
      // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 1000);
      
      // Réinitialiser le contrôleur d'annulation
      abortControllerRef.current = null;
    }
  }, [
    getSavedExercises, 
    getSavedLessonPlans, 
    getSavedCorrespondences, 
    getSavedImages, 
    toast, 
    user, 
    authReady, 
    cancelFetch
  ]);

  // Charger le contenu une fois l'authentification terminée
  useEffect(() => {
    if (authReady && user && !hasLoadedData.current && !fetchInProgress.current) {
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
          // Supprimer du state sans appel serveur pour l'instant
          setContent(prev => prev.filter(item => item.id !== id));
          toast({ description: "Image supprimée du cache local" });
          break;
        default:
          console.error("Type de contenu non reconnu:", type);
          return;
      }
      
      // Mettre à jour le contenu après la suppression seulement si ce n'est pas une image
      if (type !== 'Image') {
        setContent(prev => prev.filter(item => item.id !== id));
      }
      
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
      if (!fetchInProgress.current) {
        hasLoadedData.current = false; // Invalider le cache lors d'un rafraîchissement manuel
        return fetchContent(true);
      }
    },
    handleDelete,
    cleanup: cancelFetch // Exposer la fonction de nettoyage
  };
}
