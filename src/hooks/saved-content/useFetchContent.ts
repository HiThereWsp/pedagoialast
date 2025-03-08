
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useAuth } from "@/hooks/useAuth";
import type { SavedContent } from "@/types/saved-content";
import { ContentErrors, FetchConfig } from "./types";
import { MAX_RETRIES, RETRY_DELAY_BASE, MAX_RETRY_DELAY, FETCH_INITIAL_DELAY } from "./constants";

export function useFetchContent() {
  const [errors, setErrors] = useState<ContentErrors>({});
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchInProgress = useRef(false);
  const hasLoadedData = useRef(false);
  const retryCount = useRef(0);
  const requestCount = useRef(0);
  const lastRequestTime = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const MIN_REQUEST_INTERVAL = 5000; // 5 secondes minimum entre les requêtes
  
  const {
    isLoadingExercises,
    isLoadingLessonPlans,
    isLoadingCorrespondences,
    isLoadingImages,
    getSavedExercises,
    getSavedLessonPlans,
    getSavedCorrespondences,
    getSavedImages,
    cleanup: cleanupImageContent
  } = useSavedContent();
  
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  const cancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Réinitialiser l'état de chargement
    fetchInProgress.current = false;
  }, []);

  const shouldThrottleRequest = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRequestTime.current;
    
    // Si moins de X secondes se sont écoulées depuis la dernière requête
    if (elapsed < MIN_REQUEST_INTERVAL) {
      console.log(`Requête trop rapide (${elapsed}ms depuis la dernière). Attendre ${MIN_REQUEST_INTERVAL}ms minimum.`);
      return true;
    }
    
    return false;
  }, []);

  const fetchContent = useCallback(async ({ forceRefresh = false, signal }: FetchConfig = {}): Promise<SavedContent[]> => {
    // Annuler toute requête en cours
    cancelFetch();
    
    // Limiter la fréquence des requêtes
    if (!forceRefresh && shouldThrottleRequest()) {
      console.log("Requête limitée en fréquence");
      return [];
    }
    
    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    const abortSignal = signal || abortControllerRef.current.signal;
    
    // Incrémenter le compteur de requêtes pour le débogage
    requestCount.current += 1;
    const currentRequest = requestCount.current;
    
    // Éviter les appels concurrents ou inutiles
    if (fetchInProgress.current && !forceRefresh) {
      console.log(`[Requête ${currentRequest}] Récupération des données déjà en cours, ignorer cette demande`);
      return [];
    }

    if (hasLoadedData.current && !forceRefresh) {
      console.log(`[Requête ${currentRequest}] Données déjà chargées, utilisation du cache`);
      return [];
    }

    if (!user && authReady) {
      console.log(`[Requête ${currentRequest}] Aucun utilisateur connecté, abandon du chargement des données`);
      setIsLoadingInitial(false);
      return [];
    }

    try {
      fetchInProgress.current = true;
      lastRequestTime.current = Date.now();
      
      if (forceRefresh) {
        setIsRefreshing(true);
        console.log(`[Requête ${currentRequest}] Rafraîchissement forcé des données`);
      } else {
        console.log(`[Requête ${currentRequest}] Début de la récupération des contenus sauvegardés...`);
      }
      
      // Ajouter un délai pour éviter les requêtes trop rapprochées
      await new Promise(resolve => setTimeout(resolve, FETCH_INITIAL_DELAY));
      
      // Vérifier si la requête n'a pas été annulée
      if (abortSignal.aborted) {
        console.log(`[Requête ${currentRequest}] Requête annulée, abandon`);
        return [];
      }
      
      // Récupérer les données de manière séquentielle pour éviter les problèmes de charge
      let exercises: SavedContent[] = [];
      let lessonPlans: SavedContent[] = [];
      let correspondences: SavedContent[] = [];
      let images: SavedContent[] = [];
      
      // 1. Récupérer les exercices
      try {
        exercises = await getSavedExercises();
        if (abortSignal.aborted) return [];
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des exercices:`, err);
        setErrors(prev => ({ ...prev, exercises: "Impossible de charger les exercices" }));
      }
      
      // 2. Récupérer les plans de leçon
      try {
        lessonPlans = await getSavedLessonPlans();
        if (abortSignal.aborted) return [];
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des plans de leçon:`, err);
        setErrors(prev => ({ ...prev, lessonPlans: "Impossible de charger les séquences" }));
      }
      
      // 3. Récupérer les correspondances
      try {
        correspondences = await getSavedCorrespondences();
        if (abortSignal.aborted) return [];
      } catch (err) {
        console.error(`[Requête ${currentRequest}] Erreur lors de la récupération des correspondances:`, err);
        setErrors(prev => ({ ...prev, correspondences: "Impossible de charger les correspondances" }));
      }
      
      // 4. Récupérer les images
      try {
        // Passer forceRefresh pour garantir des données fraîches si nécessaire
        const imageData = await getSavedImages(forceRefresh);
        
        if (abortSignal.aborted) return [];
        
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
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log(`[Requête ${currentRequest}] Requête annulée, abandon du traitement des données`);
        return [];
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

      if (abortSignal.aborted) return [];

      const sortedContent = allContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Marquer le chargement comme terminé
      hasLoadedData.current = true;
      retryCount.current = 0;
      
      return sortedContent;

    } catch (err) {
      console.error(`[Requête ${currentRequest}] Erreur lors du chargement des contenus:`, err);
      
      if (abortSignal.aborted) return [];

      // Gestion des tentatives avec délai progressif
      if (retryCount.current < MAX_RETRIES && forceRefresh) {
        retryCount.current += 1;
        const delay = Math.min(RETRY_DELAY_BASE * retryCount.current, MAX_RETRY_DELAY);
        console.log(`[Requête ${currentRequest}] Nouvelle tentative ${retryCount.current}/${MAX_RETRIES} dans ${delay/1000}s...`);
        
        await new Promise(r => setTimeout(r, delay));
        
        if (!abortSignal.aborted) {
          return fetchContent({ forceRefresh: true, signal: abortSignal });
        }
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
      
      return [];
    } finally {
      setIsLoadingInitial(false);
      setIsRefreshing(false);
      
      // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
      setTimeout(() => {
        fetchInProgress.current = false;
      }, MAX_RETRY_DELAY);
    }
  }, [
    getSavedExercises, 
    getSavedLessonPlans, 
    getSavedCorrespondences, 
    getSavedImages, 
    toast, 
    user, 
    authReady, 
    cancelFetch,
    shouldThrottleRequest
  ]);

  const isLoading = isLoadingInitial || isLoadingExercises || isLoadingLessonPlans || isLoadingCorrespondences || isLoadingImages;

  return {
    fetchContent,
    cancelFetch,
    errors,
    isLoading,
    isRefreshing,
    setErrors,
    hasLoadedData,
    cleanupImageContent
  };
}
