
import { useCallback, useRef } from "react";
import { MIN_REQUEST_INTERVAL } from "./constants";

/**
 * Hook for managing request abort controllers and throttling
 */
export function useFetchAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTime = useRef(0);
  const fetchInProgress = useRef(false);

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

  // Marquer le début d'une requête
  const markRequestStart = useCallback(() => {
    fetchInProgress.current = true;
    lastRequestTime.current = Date.now();
  }, []);

  // Marquer la fin d'une requête
  const markRequestEnd = useCallback(() => {
    // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
    setTimeout(() => {
      fetchInProgress.current = false;
    }, 800);
  }, []);

  // Vérifier si une requête est en cours
  const isFetchInProgress = useCallback(() => {
    return fetchInProgress.current;
  }, []);

  return {
    shouldThrottleRequest,
    createAbortController,
    abortRequest,
    markRequestStart,
    markRequestEnd,
    isFetchInProgress
  };
}
