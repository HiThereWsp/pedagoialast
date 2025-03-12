
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { SavedContent } from "@/types/saved-content";
import { FetchConfig } from "./types";
import { useContentCache } from "./useContentCache";
import { useRequestStatus } from "./useRequestStatus";
import { useContentErrors } from "./useContentErrors";
import { useContentRetrieval } from "./useContentRetrieval";

export function useFetchContent() {
  const { errors, addError, showErrorToast } = useContentErrors();
  const { 
    isLoadingInitial, 
    isRefreshing,
    shouldThrottleRequest,
    createAbortController,
    abortRequest,
    startRequest,
    finishRequest,
    incrementRetryCount,
    setLoading,
    hasLoaded
  } = useRequestStatus();
  
  const {
    getCachedContent,
    updateCache,
    getPendingContent,
    updatePendingContent,
    invalidateCache,
    hasDataReceived,
    setDataReceived
  } = useContentCache();

  const {
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    handleRetry,
    isContentLoading
  } = useContentRetrieval();
  
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  // Fonction améliorée qui n'annule que les requêtes non terminées et préserve les données partielles
  const cancelFetch = useCallback(() => {
    // CORRECTION CRITIQUE: Si des données partielles ont été récupérées, on les sauvegarde dans le cache AVANT d'annuler
    const pendingContent = getPendingContent();
    if (pendingContent && pendingContent.length > 0) {
      console.log(`⚠️ Sauvegarde des ${pendingContent.length} éléments dans le cache avant annulation`);
      updateCache(pendingContent);
      setDataReceived(true);
    } else {
      console.log("🛑 Annulation d'une requête en cours (aucune donnée partielle)");
    }
    
    abortRequest();
  }, [abortRequest, getPendingContent, updateCache, setDataReceived]);

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
      
      // CORRECTION CRITIQUE: Même si la requête est annulée, utiliser les données partielles
      if (abortSignal.aborted) {
        console.log(`🛑 [Requête ${currentRequest}] Requête annulée avant finalisation`);
        const partialContent = getPendingContent();
        
        if (partialContent && partialContent.length > 0) {
          console.log(`🔆 [Requête ${currentRequest}] Utilisation des données partielles: ${partialContent.length} éléments`);
          // Trier les données partielles avant de les retourner
          const sortedPartialContent = partialContent.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
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
        images: images?.length || 0
      });
      
      // Combiner toutes les données et les trier par date
      const allContent = [
        ...exercises, 
        ...lessonPlans, 
        ...correspondences,
        ...images
      ].filter(Boolean);

      // Trier par date de création (plus récent en premier)
      const sortedContent = allContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
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
      console.error(`❌ [Requête ${currentRequest}] Erreur lors du chargement des contenus:`, err);
      
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
      
      if (err instanceof Error) {
        addError('images', "Une erreur est survenue lors du chargement de vos contenus");
        
        showErrorToast(
          "Erreur de chargement", 
          "Impossible de charger vos contenus. Veuillez réessayer ultérieurement."
        );
      }
      
      // CORRECTION: Toujours retourner le cache même en cas d'erreur
      return getCachedContent();
    } finally {
      finishRequest();
    }
  }, [
    user, 
    authReady,
    shouldThrottleRequest,
    createAbortController,
    startRequest,
    retrieveExercises,
    retrieveLessonPlans,
    retrieveCorrespondences,
    retrieveImages,
    getPendingContent,
    updatePendingContent,
    hasDataReceived,
    setDataReceived,
    getCachedContent,
    updateCache,
    handleRetry,
    incrementRetryCount,
    finishRequest,
    setLoading,
    addError,
    showErrorToast
  ]);

  const isLoading = isLoadingInitial || isContentLoading;

  return {
    fetchContent,
    cancelFetch,
    invalidateCache,
    errors,
    isLoading,
    isRefreshing,
    hasLoadedData: hasLoaded,
    cleanupImageContent: cancelFetch
  };
}
