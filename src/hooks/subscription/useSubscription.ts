
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { SubscriptionStatus, initialStatus, REFRESH_INTERVAL } from './types';
import { getCachedStatus, cacheSubscriptionStatus, clearSubscriptionCache } from './useSubscriptionCache';
import { checkDevMode } from './useDevMode';
import { checkUserSession } from './useSessionCheck';
import { checkUserAccess } from './useAccessCheck';
import { useSubscriptionErrorHandling } from './useSubscriptionErrorHandling';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  // Add a flag to prevent multiple simultaneous checks
  const [isChecking, setIsChecking] = useState(false);
  // Track last check time
  const lastCheckRef = useRef<number>(0);
  const navigate = useNavigate();

  // Always use React Router's navigate for navigation
  const safeNavigate = useCallback((path: string) => {
    console.log(`Safe navigation to: ${path}`);
    setTimeout(() => navigate(path), 50); // Small delay to ensure React can complete current renders
  }, [navigate]);

  // Define checkSubscription with proper dependencies
  const checkSubscription = useCallback(async (force = false) => {
    // Don't run checks too frequently (throttle to once per second unless forced)
    const now = Date.now();
    if (!force && now - lastCheckRef.current < 1000) {
      console.log("Subscription check throttled, skipped");
      return;
    }
    lastCheckRef.current = now;
    
    // Prevent multiple simultaneous checks
    if (isChecking && !force) {
      console.log("A subscription check is already in progress, skipped");
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
    // Refresh status every hour
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
    
    // Handle special development mode
    if (import.meta.env.DEV) {
      console.log("Development mode detected in requireSubscription, granting access");
      return true;
    }
    
    // Consider special accesses as valid
    if (status.type === 'beta' || status.type === 'dev_mode' || status.type === 'ambassador') {
      if (status.special_handling) {
        console.log("Special handling detected, granting access");
      }
      return true;
    }
    
    if (!status.isActive) {
      toast.error("Abonnement requis pour accéder à cette fonctionnalité");
      safeNavigate('/pricing');
      return false;
    }
    
    return true;
  }, [status, safeNavigate]);

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
