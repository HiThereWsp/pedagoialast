
import { useState, useEffect } from 'react';
import { SubscriptionStatus, initialStatus, VERIFICATION_TIMEOUT } from './types';
import { logSubscriptionError } from './useErrorLogging';
import { clearSubscriptionCache } from './useSubscriptionCache';

/**
 * Hook for handling subscription errors and retries
 */
export const useSubscriptionErrorHandling = (
  status: SubscriptionStatus,
  checkSubscription: (force: boolean) => void
) => {
  const [verificationTimeout, setVerificationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  // Set a verification timeout to avoid infinite loading states
  useEffect(() => {
    if (status.isLoading && !verificationTimeout) {
      const timeoutId = setTimeout(() => {
        console.log('Verification timeout reached, forcing subscription reset');
        
        // Force subscription check if we're stuck in loading state too long
        clearSubscriptionCache();
        checkSubscription(true);
      }, VERIFICATION_TIMEOUT);
      
      setVerificationTimeout(timeoutId);
    } else if (!status.isLoading && verificationTimeout) {
      clearTimeout(verificationTimeout);
      setVerificationTimeout(null);
    }
    
    return () => {
      if (verificationTimeout) {
        clearTimeout(verificationTimeout);
      }
    };
  }, [status.isLoading, checkSubscription, verificationTimeout]);

  /**
   * Handle subscription verification error
   */
  const handleSubscriptionError = (error: Error, currentStatus: SubscriptionStatus) => {
    console.error("Critical error during subscription check:", error);
    
    // Special handling for specific emails
    const checkSpecialEmail = (): SubscriptionStatus | null => {
      try {
        const userDataStr = localStorage.getItem('supabase.auth.token');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          const email = userData?.currentSession?.user?.email;
          
          if (!email) return null;
          
          // Ambassador email special case
          if (email === 'ag.tradeunion@gmail.com') {
            console.log('Ambassador email detected with special handling:', email);
            return {
              isActive: true,
              type: 'ambassador',
              expiresAt: new Date('2025-08-28').toISOString(),
              isLoading: false,
              error: null,
              retryCount: 0,
              special_handling: true
            };
          }
          
          // Beta email domains special case
          const specialBetaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
          const specialBetaEmails = ['andyguitteaud@gmail.com']; 
          
          if (specialBetaEmails.includes(email)) {
            console.log('Beta email detected:', email);
            return {
              isActive: true,
              type: 'beta',
              expiresAt: null,
              isLoading: false,
              error: null,
              retryCount: 0
            };
          }
          
          const emailDomain = email.split('@')[1];
          if (specialBetaDomains.includes(emailDomain)) {
            console.log('Beta domain detected:', emailDomain);
            return {
              isActive: true,
              type: 'beta',
              expiresAt: null,
              isLoading: false,
              error: null,
              retryCount: 0
            };
          }
        }
      } catch (err) {
        console.error('Error checking special email status:', err);
      }
      return null;
    };
    
    // Check for special email handling first
    const specialStatus = checkSpecialEmail();
    if (specialStatus) {
      return specialStatus;
    }
    
    // If no special handling, return the error status
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
