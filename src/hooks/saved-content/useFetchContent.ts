import { useCallback, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { SavedContent } from "@/types/saved-content";
import { FetchConfig } from "./types";
import { useContentRetrieval } from "./useContentRetrieval";
import { useFetchAbortController } from "./useFetchAbortController";
import { useContentProcessing } from "./useContentProcessing";
import { useRetryStrategy } from "./useRetryStrategy";

export function useFetchContent() {
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedData = useRef(false);
  
  const { user, authReady } = useAuth();
  const { toast } = useToast();

  const {
    shouldThrottleRequest,
    createAbortController,
    abortRequest,
    markRequestStart,
    markRequestEnd,
    isFetchInProgress
  } = useFetchAbortController();
  
  const {
    savePartialContent,
    processFinalContent,
    handleFetchError,
    getCachedContent,
    updateCache,
    getPendingContent,
    updatePendingContent,
    setDataReceived,
    hasDataReceived,
    invalidateCache
  } = useContentProcessing();
  
  const {
    startRequest,
    resetRetryCount,
    incrementRetryCount,
    handleRetry
  } = useRetryStrategy();

  const {
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    retrieveMusicLessons,
    isContentLoading
  } = useContentRetrieval();

  // Fonction améliorée qui n'annule que les requêtes non terminées et préserve les données partielles
  const cancelFetch = useCallback(() => {
    savePartialContent();
    abortRequest();
  }, [abortRequest, savePartialContent]);

  // Définir l'état de chargement
  const setLoading = useCallback((loading: boolean, refreshing: boolean = false) => {
    setIsLoadingInitial(loading);
    setIsRefreshing(refreshing);
  }, []);

  const fetchContent = useCallback(async ({ forceRefresh = false, signal }: FetchConfig = {}): Promise<SavedContent[]> => {
    // 📋 DEBUG: Vérification de l'état d'authentification
    console.log("📋 DEBUG: État d'authentification avant fetchContent", { 
      user: user ? "connecté" : "non connecté", 
      userID: user?.id,
      authReady, 
      cacheSize: getCachedContent().length,
      dataWasReceived: hasDataReceived()
    });
    
    // Pour un rafraîchissement forcé, réinitialiser la référence de données reçues
    if (forceRefresh) {
      setDataReceived(false);
    }
    
    // Si nous avons des données en cache et ce n'est pas un rafraîchissement forcé, retourner le cache
    const cachedContent = getCachedContent();
    if (cachedContent.length > 0 && !forceRefresh) {
      console.log(`🔄 Utilisation du cache: ${cachedContent.length} éléments`);
      return cachedContent;
    }
    
    // Si l'utilisateur n'est pas authentifié ou le processus d'authentification n'est pas terminé
    if (!user && authReady) {
      console.log("❌ Aucun utilisateur connecté, abandon du chargement");
      setLoading(false);
      return [];
    }
    
    // Limiter la fréquence des requêtes - mais ne pas bloquer les requêtes forcées
    if (!forceRefresh && shouldThrottleRequest()) {
      console.log("⏱️ Requête limitée en fréquence, utilisation du cache disponible");
      return getCachedContent();
    }
    
    // Créer un nouveau contrôleur d'annulation si besoin
    const abortSignal = signal || createAbortController();
    
    // Incrémenter le compteur de requêtes pour le débogage
    const currentRequest = startRequest();
    markRequestStart();
    
    try {
      if (forceRefresh) {
        setLoading(false, true);
        console.log(`🔄 [Requête ${currentRequest}] Rafraîchissement forcé des données`);
      } else {
        console.log(`🔄 [Requête ${currentRequest}] Début de la récupération des contenus sauvegardés...`);
      }
      
      // AJOUT: Vérification supplémentaire du statut utilisateur
      if (!user) {
        console.log(`❌ [Requête ${currentRequest}] Utilisateur non disponible après délai, abandon`);
        return getCachedContent();
      }
      
      console.log(`👤 [Requête ${currentRequest}] Utilisateur authentifié: ${user.id}`);
      
      // Vérifier si la requête n'a pas été annulée
      if (abortSignal.aborted) {
        console.log(`🛑 [Requête ${currentRequest}] Requête annulée avant récupération, abandon`);
        return getCachedContent();
      }
      
      // Récupérer les données de manière séquentielle pour éviter les problèmes de charge
      updatePendingContent(null);
      
      // 1. Récupérer les exercices
      const exercises = await retrieveExercises(abortSignal, forceRefresh, currentRequest);
      
      // 2. Récupérer les plans de leçon
      const lessonPlans = await retrieveLessonPlans(abortSignal, forceRefresh, currentRequest);
      
      // 3. Récupérer les correspondances
      const correspondences = await retrieveCorrespondences(abortSignal, forceRefresh, currentRequest);
      
      // 4. Récupérer les images
      const images = await retrieveImages(abortSignal, forceRefresh, currentRequest);
      
      // 5. Récupérer les leçons en musique
      const musicLessons = await retrieveMusicLessons(abortSignal, forceRefresh, currentRequest);
      
      // CORRECTION CRITIQUE: Même si la requête est annulée, utiliser les données partielles
      if (abortSignal.aborted) {
        console.log(`🛑 [Requête ${currentRequest}] Requête annulée avant finalisation`);
        const partialContent = getPendingContent();
        
        if (partialContent && partialContent.length > 0) {
          console.log(`🔆 [Requête ${currentRequest}] Utilisation des données partielles: ${partialContent.length} éléments`);
          // Trier les données partielles avant de les retourner
          const sortedPartialContent = processFinalContent(partialContent);
          
          // Mettre à jour le cache avec les données partielles
          updateCache(sortedPartialContent);
          updatePendingContent(null);
          
          return sortedPartialContent;
        }
        
        return getCachedContent();
      }

      console.log(`📊 [Requête ${currentRequest}] Données récupérées:`, {
        exercises: exercises?.length || 0,
        lessonPlans: lessonPlans?.length || 0,
        correspondences: correspondences?.length || 0,
        images: images?.length || 0,
        musicLessons: musicLessons?.length || 0
      });
      
      // Combiner toutes les données et les trier par date
      const allContent = [
        ...exercises, 
        ...lessonPlans, 
        ...correspondences,
        ...images,
        ...musicLessons
      ].filter(Boolean);

      // Trier et finaliser le contenu
      const sortedContent = processFinalContent(allContent);
      
      console.log(`✅ [Requête ${currentRequest}] Récupération terminée avec ${sortedContent.length} éléments`);
      
      // CORRECTION CRITIQUE: Si on a reçu des données, mettre à jour le cache même si sortedContent est vide
      if (sortedContent.length > 0 || hasDataReceived()) {
        console.log(`✅ [Requête ${currentRequest}] Mise à jour du cache avec ${sortedContent.length} éléments`);
        updateCache(sortedContent);
        updatePendingContent(null);
      } else {
        console.log(`⚠️ [Requête ${currentRequest}] Résultat vide mais cache existant préservé`);
      }
      
      return sortedContent;

    } catch (err) {
      handleFetchError(err, currentRequest);
      
      if (abortSignal.aborted) {
        // Utiliser les données partielles si disponibles
        const pendingContent = getPendingContent();
        if (pendingContent && pendingContent.length > 0) {
          console.log(`🔆 [Requête ${currentRequest}] Utilisation des données partielles malgré erreur: ${pendingContent.length} éléments`);
          updateCache(pendingContent);
          updatePendingContent(null);
        }
        return getCachedContent();
      }

      // Gestion des tentatives avec délai progressif
      const shouldRetry = await handleRetry(forceRefresh, abortSignal);
      if (shouldRetry) {
        incrementRetryCount();
        return fetchContent({ forceRefresh: true, signal: abortSignal });
      }
      
      // CORRECTION: Toujours retourner le cache même en cas d'erreur
      return getCachedContent();
    } finally {
      markRequestEnd();
      hasLoadedData.current = true;
      resetRetryCount();
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [
    user, 
    authReady,
    shouldThrottleRequest,
    createAbortController,
    startRequest,
    markRequestStart,
    markRequestEnd,
    resetRetryCount,
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    retrieveMusicLessons,
    getPendingContent,
    updatePendingContent,
    processFinalContent,
    hasDataReceived,
    setDataReceived,
    getCachedContent,
    updateCache,
    handleRetry,
    incrementRetryCount,
    handleFetchError,
    setLoading
  ]);

  const hasLoaded = useCallback(() => {
    return hasLoadedData.current;
  }, []);

  return {
    fetchContent,
    cancelFetch,
    invalidateCache,
    errors: {},  // Maintenant géré par useContentErrors
    isLoading: isLoadingInitial || isContentLoading,
    isRefreshing,
    hasLoadedData: hasLoaded,
    cleanupImageContent: cancelFetch
  };
}
