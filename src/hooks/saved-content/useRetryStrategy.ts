
import { useCallback, useRef } from "react";
import { MAX_RETRIES, RETRY_DELAY_BASE, MAX_RETRY_DELAY } from "./constants";

/**
 * Hook pour gérer la stratégie de tentatives pour les requêtes
 */
export function useRetryStrategy() {
  const retryCount = useRef(0);
  const requestCount = useRef(0);

  // Incrémenter le compteur de requêtes
  const startRequest = useCallback(() => {
    requestCount.current += 1;
    return requestCount.current;
  }, []);

  // Réinitialiser le compteur de tentatives
  const resetRetryCount = useCallback(() => {
    retryCount.current = 0;
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

  // Méthode pour gérer une tentative avec délai progressif
  const handleRetry = useCallback(async (forceRefresh: boolean, signal: AbortSignal): Promise<boolean> => {
    if (retryCount.current < MAX_RETRIES && forceRefresh && !signal.aborted) {
      const delay = Math.min(RETRY_DELAY_BASE * retryCount.current, MAX_RETRY_DELAY);
      console.log(`🔄 Nouvelle tentative ${retryCount.current}/${MAX_RETRIES} dans ${delay/1000}s...`);
      
      await new Promise(r => setTimeout(r, delay));
      return !signal.aborted;
    }
    
    return false;
  }, []);

  return {
    startRequest,
    resetRetryCount,
    incrementRetryCount,
    getRetryCount,
    handleRetry,
    getCurrentRequestCount: () => requestCount.current
  };
}
