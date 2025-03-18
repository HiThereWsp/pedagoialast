
import { useState, useEffect } from 'react';
import { SubscriptionStatus, initialStatus } from './types';
import { logSubscriptionError } from './useErrorLogging';
import { clearSubscriptionCache } from './useSubscriptionCache';

/**
 * Hook for handling subscription errors and retries
 */
export const useSubscriptionErrorHandling = (
  status: SubscriptionStatus,
  checkSubscription: (force: boolean) => void
) => {
  // Automatic retry with exponential delay and limited attempts
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;
    
    if (status.error && status.retryCount < 3) {
      const retryDelay = Math.pow(2, status.retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${retryDelay/1000}s... (attempt ${status.retryCount + 1}/3)`);
      
      retryTimer = setTimeout(() => {
        console.log(`Attempting check #${status.retryCount + 1}`);
        // Clear cache before retry to prevent using stale data
        clearSubscriptionCache();
        checkSubscription(true); // Force check without using cache
      }, retryDelay);
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [status.error, status.retryCount, checkSubscription]);

  /**
   * Handle subscription verification error
   */
  const handleSubscriptionError = (error: Error, currentStatus: SubscriptionStatus) => {
    console.error("Critical error during subscription check:", error);
    
    // Special handling for beta emails
    const checkBetaEmail = (email?: string): boolean => {
      if (!email) return false;
      
      const specialBetaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
      const specialBetaEmails = ['andyguitteaud@gmail.com']; 
      
      if (specialBetaEmails.includes(email)) {
        console.log('Beta email detected:', email);
        return true;
      }
      
      const emailDomain = email.split('@')[1];
      if (specialBetaDomains.includes(emailDomain)) {
        console.log('Beta domain detected:', emailDomain);
        return true;
      }
      
      return false;
    };
    
    const criticalErrorStatus = {
      ...initialStatus,
      isLoading: false,
      error: error.message || "Unknown server error",
      retryCount: currentStatus.retryCount + 1
    };
    
    logSubscriptionError('critical_error', error);
    return criticalErrorStatus;
  };

  return {
    handleSubscriptionError
  };
};
