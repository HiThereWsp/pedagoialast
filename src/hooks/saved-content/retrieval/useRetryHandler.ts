
import { useCallback } from "react";
import { useRequestStatus } from "../useRequestStatus";
import { MAX_RETRIES, RETRY_DELAY_BASE, MAX_RETRY_DELAY } from "../constants";

/**
 * Hook pour gérer la logique de retry
 */
export function useRetryHandler() {
  const { getRetryCount } = useRequestStatus();

  // Méthode pour gérer une tentative avec délai progressif
  const handleRetry = useCallback(async (forceRefresh: boolean, signal: AbortSignal): Promise<boolean> => {
    const retryCount = getRetryCount();
    
    if (retryCount < MAX_RETRIES && forceRefresh && !signal.aborted) {
      const delay = Math.min(RETRY_DELAY_BASE * retryCount, MAX_RETRY_DELAY);
      console.log(`🔄 Nouvelle tentative ${retryCount}/${MAX_RETRIES} dans ${delay/1000}s...`);
      
      await new Promise(r => setTimeout(r, delay));
      return !signal.aborted;
    }
    
    return false;
  }, [getRetryCount]);

  return {
    handleRetry
  };
}
