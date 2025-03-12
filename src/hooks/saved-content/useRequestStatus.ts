
import { useState, useRef, useCallback } from "react";
import { MIN_REQUEST_INTERVAL } from "./constants";

/**
 * Hook pour gérer l'état des requêtes
 */
export function useRequestStatus() {
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchInProgress = useRef(false);
  const hasLoadedData = useRef(false);
  const retryCount = useRef(0);
  const requestCount = useRef(0);
  const lastRequestTime = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Vérifier si une requête est en cours
  const isFetchInProgress = useCallback(() => {
    return fetchInProgress.current;
  }, []);

  // Vérifier si des données ont été chargées
  const hasLoaded = useCallback(() => {
    return hasLoadedData.current;
  }, []);

  // Vérifier si une requête doit être limitée en fréquence
  const shouldThrottleRequest = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRequestTime.current;
    
    // Si moins de X secondes se sont écoulées depuis la dernière requête
    if (elapsed < MIN_REQUEST_INTERVAL) {
      console.log(`⏱️ Requête trop rapide (${elapsed}ms depuis la dernière). Attendre ${MIN_REQUEST_INTERVAL}ms minimum.`);
      return true;
    }
    
    return false;
  }, []);

  // Créer un nouvel AbortController
  const createAbortController = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  }, []);

  // Annuler une requête en cours
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("🛑 Annulation d'une requête en cours");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Démarrer une requête
  const startRequest = useCallback(() => {
    fetchInProgress.current = true;
    lastRequestTime.current = Date.now();
    requestCount.current += 1;
    return requestCount.current;
  }, []);

  // Terminer une requête
  const finishRequest = useCallback(() => {
    hasLoadedData.current = true;
    retryCount.current = 0;
    setIsLoadingInitial(false);
    setIsRefreshing(false);
    
    // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
    setTimeout(() => {
      fetchInProgress.current = false;
    }, 800); // Délai réduit pour permettre des requêtes plus fréquentes
  }, []);

  // Incrémenter le compteur de tentatives
  const incrementRetryCount = useCallback(() => {
    retryCount.current += 1;
    return retryCount.current;
  }, []);

  // Récupérer le compteur de tentatives
  const getRetryCount = useCallback(() => {
    return retryCount.current;
  }, []);

  // Définir l'état de chargement
  const setLoading = useCallback((loading: boolean, refreshing: boolean = false) => {
    setIsLoadingInitial(loading);
    setIsRefreshing(refreshing);
  }, []);

  return {
    isLoadingInitial,
    isRefreshing,
    setLoading,
    isFetchInProgress,
    hasLoaded,
    shouldThrottleRequest,
    createAbortController,
    abortRequest,
    startRequest,
    finishRequest,
    incrementRetryCount,
    getRetryCount,
    getCurrentRequestCount: () => requestCount.current
  };
}
