import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubscriptionStatus, initialStatus, REFRESH_INTERVAL } from './types';
import { getCachedStatus, cacheSubscriptionStatus, clearSubscriptionCache } from './useSubscriptionCache';
import { checkDevMode } from './useDevMode';
import { checkUserSession } from './useSessionCheck';
import { checkUserAccess } from './useAccessCheck';
import { useSubscriptionErrorHandling } from './useSubscriptionErrorHandling';

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  // Add a flag to prevent multiple simultaneous checks
  const [isChecking, setIsChecking] = useState(false);

  // Define checkSubscription with proper dependencies
  const checkSubscription = useCallback(async (force = false) => {
    // Prevent multiple simultaneous checks
    if (isChecking && !force) {
      console.log("A check is already in progress, skipped");
      return;
    }
    
    // If not forcing, check cache first
    if (!force) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        console.log("Using cached subscription status", cachedStatus);
        setStatus(cachedStatus);
        return;
      }
    }
    
    // Otherwise proceed with verification
    setIsChecking(true); // Mark as checking
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Ensure isLoading is reset in case of errors during checks
    try {
      // Check development mode first (short-circuits other checks)
      if (checkDevMode(setStatus)) {
        setIsChecking(false);
        return;
      }
      
      // Check user session
      const session = await checkUserSession(setStatus);
      if (!session) {
        setIsChecking(false);
        return;
      }
      
      // Check user access
      await checkUserAccess(status, setStatus);
    } catch (error) {
      const criticalErrorStatus = errorHandler.handleSubscriptionError(error, status);
      setStatus(criticalErrorStatus);
    } finally {
      setIsChecking(false);
    }
  }, [status, isChecking]);

  // Use the error handling hook
  const errorHandler = useSubscriptionErrorHandling(status, checkSubscription);

  // Check subscription once on component load
  useEffect(() => {
    let mounted = true;
    
    // Use a setTimeout to avoid rendering issues
    const timer = setTimeout(() => {
      if (mounted) {
        checkSubscription();
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
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
   * Check if user has a valid subscription, otherwise redirect to pricing page
   * @returns {boolean} True if user can access feature
   */
  const requireSubscription = useCallback(() => {
    if (status.isLoading) return true; // Wait for loading
    
    // Consider special accesses as valid
    if (status.type === 'beta' || status.type === 'dev_mode') return true;
    
    if (!status.isActive) {
      toast.error("Abonnement requis pour accéder à cette fonctionnalité");
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
