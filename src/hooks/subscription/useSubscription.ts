import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubscriptionStatus, initialStatus, REFRESH_INTERVAL } from './types';
import { getCachedStatus, cacheSubscriptionStatus } from './useSubscriptionCache';
import { logSubscriptionError } from './useErrorLogging';
import { checkDevMode } from './useDevMode';
import { checkUserSession } from './useSessionCheck';
import { checkUserAccess } from './useAccessCheck';

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  /**
   * Main function to check subscription
   */
  const checkSubscription = useCallback(async (force = false) => {
    // If not forcing the check, check the cache first
    if (!force) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        console.log("Using cached subscription status", cachedStatus);
        setStatus(prev => ({
          ...cachedStatus,
          isLoading: false,
          error: null
        }));
        return;
      }
    }
    
    // Otherwise proceed with the check
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // In case of error during checks, ensure isLoading is properly reset
    try {
      // Check development mode first (short-circuits other checks)
      if (checkDevMode(setStatus)) return;
      
      // Check user session
      const session = await checkUserSession(setStatus);
      if (!session) return;
      
      // Check user access
      await checkUserAccess(status, setStatus);
    } catch (error) {
      console.error("Critical error during subscription check:", error);
      
      const criticalErrorStatus = {
        ...initialStatus,
        isLoading: false,
        error: "Critical error: " + (error.message || "unknown"),
        retryCount: status.retryCount + 1
      };
      
      setStatus(criticalErrorStatus);
      logSubscriptionError('critical_error', error);
    }
  }, [status]);

  // Automatic retry with exponential delay on error
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

  // Check subscription on component load
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);
  
  // Periodically refresh subscription status
  useEffect(() => {
    // Refresh status every 30 minutes
    const refreshInterval = setInterval(() => {
      console.log('Periodic subscription status refresh');
      checkSubscription(true); // Force a complete check
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
  }, [checkSubscription]);

  /**
   * Check if user has valid subscription, otherwise redirect to pricing page
   * @returns {boolean} True if user can access feature
   */
  const requireSubscription = useCallback(() => {
    if (status.isLoading) return true; // Wait for loading
    
    // Consider special accesses as valid
    if (status.type === 'beta' || status.type === 'dev_mode') return true;
    
    if (!status.isActive) {
      toast.error("Subscription required to access this feature");
      window.location.href = '/pricing';
      return false;
    }
    
    return true;
  }, [status]);

  return {
    isSubscribed: status.isActive,
    subscriptionType: status.type,
    expiresAt: status.expiresAt,
    isLoading: status.isLoading,
    error: status.error,
    checkSubscription,
    requireSubscription
  };
};
