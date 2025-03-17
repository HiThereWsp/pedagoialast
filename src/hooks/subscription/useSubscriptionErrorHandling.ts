
import { useState, useEffect } from 'react';
import { SubscriptionStatus } from './types';
import { logSubscriptionError } from './useErrorLogging';

/**
 * Hook pour gérer les erreurs et les retries pour l'abonnement
 */
export const useSubscriptionErrorHandling = (
  status: SubscriptionStatus,
  checkSubscription: (force: boolean) => void
) => {
  // Gestion des retries automatiques avec délai exponentiel
  useEffect(() => {
    if (status.error && status.retryCount < 3) {
      const retryDelay = Math.pow(2, status.retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${retryDelay/1000}s... (attempt ${status.retryCount + 1}/3)`);
      
      const retryTimer = setTimeout(() => {
        console.log(`Attempting check #${status.retryCount + 1}`);
        checkSubscription(true); // Force check without using cache
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [status.error, status.retryCount, checkSubscription]);

  /**
   * Gère une erreur lors de la vérification de l'abonnement
   */
  const handleSubscriptionError = (error: Error, currentStatus: SubscriptionStatus) => {
    console.error("Critical error during subscription check:", error);
    
    const criticalErrorStatus = {
      ...currentStatus,
      isLoading: false,
      error: "Critical error: " + (error.message || "unknown"),
      retryCount: currentStatus.retryCount + 1
    };
    
    logSubscriptionError('critical_error', error);
    return criticalErrorStatus;
  };

  return {
    handleSubscriptionError
  };
};
