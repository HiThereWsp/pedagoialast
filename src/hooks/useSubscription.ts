import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { posthog } from '@/integrations/posthog/client';

type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  timestamp?: number;
};

const initialStatus: SubscriptionStatus = {
  isActive: false,
  type: null,
  expiresAt: null,
  isLoading: true,
  error: null,
  retryCount: 0
};

// Constants for cache management
const CACHE_KEY = 'subscription_status';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  /**
   * Cache subscription status in local storage
   */
  const cacheSubscriptionStatus = useCallback((statusToCache: SubscriptionStatus) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ...statusToCache,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.log('Error caching status:', err);
      // Continue even if caching fails
    }
  }, []);

  /**
   * Get cached subscription status
   * @returns {SubscriptionStatus|null} Cached status or null if no valid cache
   */
  const getCachedStatus = useCallback((): SubscriptionStatus | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached) as SubscriptionStatus;
      
      // Check cache age
      if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp) < CACHE_DURATION) {
        return parsedCache;
      }
    } catch (err) {
      console.log('Error retrieving cache:', err);
    }
    
    return null;
  }, []);

  /**
   * Log subscription errors
   * @param {string} errorType Error type
   * @param {any} details Error details
   */
  const logSubscriptionError = useCallback(async (errorType: string, details: any) => {
    console.error(`Subscription error: ${errorType}`, details);
    
    try {
      // Log the error in your analytics/logging system
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      await supabase.functions.invoke('log-subscription-error', {
        body: { errorType, details, userId: userId || 'anonymous' }
      }).catch(err => console.error('Failed to log error:', err));
    } catch (err) {
      console.error('Error logging:', err);
    }
  }, []);

  /**
   * Track non-subscribed user for marketing purposes
   */
  const trackNonSubscribedUser = useCallback(async () => {
    if (!status.isActive && !status.isLoading && !status.error) {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          // Log in PostHog
          posthog.capture('subscription_prompt_viewed', {
            user_id: user.id,
            source_page: window.location.pathname
          });
          
          // Record that the user saw the subscription message
          await supabase.from('user_events').insert({
            user_id: user.id,
            event_type: 'subscription_prompt_viewed',
            metadata: {
              source_page: window.location.pathname,
              timestamp: new Date().toISOString()
            }
          });
          
          // Optional: Send to email marketing system (Brevo, etc.)
          await supabase.functions.invoke('create-brevo-contact', {
            body: {
              email: user.email,
              contactName: user.user_metadata?.first_name || 'Utilisateur',
              userType: "lead", // New type for prospects
              source: "app_signup"
            }
          });
        }
      } catch (err) {
        console.error("Error tracking non-subscribed user:", err);
        // Don't block UI in case of error
      }
    }
  }, [status]);

  /**
   * Check if user is in development mode
   * @returns {boolean} True if in development mode
   */
  const checkDevMode = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Development mode detected, simulating active subscription");
      const devStatus = {
        isActive: true,
        type: 'dev_mode',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      setStatus(devStatus);
      cacheSubscriptionStatus(devStatus);
      return true;
    }
    return false;
  }, [cacheSubscriptionStatus]);

  /**
   * Check user session state
   * @returns {Promise<Session | null>} Session or null if not authenticated
   */
  const checkUserSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error retrieving session:", error.message);
        
        const errorStatus = {
          ...initialStatus,
          isLoading: false,
          error: `Session error: ${error.message}`
        };
        
        setStatus(prev => errorStatus);
        logSubscriptionError('session_error', error);
        return null;
      }
      
      if (!session) {
        console.log("No session found in useSubscription");
        
        const noSessionStatus = {
          ...initialStatus,
          isLoading: false,
          error: 'Not authenticated'
        };
        
        setStatus(noSessionStatus);
        return null;
      }
      
      return session;
    } catch (err) {
      console.error("Exception during session check:", err);
      
      const exceptionStatus = {
        ...initialStatus,
        isLoading: false,
        error: `Exception: ${err.message}`
      };
      
      setStatus(exceptionStatus);
      logSubscriptionError('session_exception', err);
      return null;
    }
  }, [logSubscriptionError]);

  /**
   * Check user access via check-user-access function
   * @returns {Promise<boolean>} True if user has active subscription
   */
  const checkUserAccess = useCallback(async () => {
    try {
      console.log("Calling check-user-access function");
      
      // Add explicit headers to resolve CORS issues
      const headers = {
        "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
        "Content-Type": "application/json",
      };
      
      const { data, error } = await supabase.functions.invoke('check-user-access', {
        headers: headers
      });
      
      if (error) {
        console.error('Edge function error:', error);
        
        // More descriptive error message based on context
        const errorMessage = error.message && error.message.includes("enum") 
          ? "Server configuration error (missing types)" 
          : error.message || "Unexpected error";
        
        const errorStatus = {
          ...initialStatus,
          isLoading: false,
          error: errorMessage,
          retryCount: status.retryCount + 1
        };
        
        setStatus(prev => errorStatus);
        logSubscriptionError('check_access_error', { error, message: errorMessage });
        
        // Detailed log to help with debugging
        console.error('Error details during access check:', {
          message: error.message,
          name: error.name,
          status: error.status,
          stack: error.stack
        });
        
        return false;
      }
      
      console.log("Response from check-user-access:", data);
      
      if (!data) {
        console.error("No data received from check-user-access");
        
        const invalidResponseStatus = {
          ...initialStatus,
          isLoading: false,
          error: "Invalid response from server",
          retryCount: status.retryCount + 1
        };
        
        setStatus(invalidResponseStatus);
        logSubscriptionError('invalid_response', { data });
        return false;
      }
      
      // Valid subscription status
      const validStatus = {
        isActive: !!data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      setStatus(validStatus);
      
      // Cache valid status
      cacheSubscriptionStatus(validStatus);
      
      return !!data.access;
    } catch (err) {
      console.error('Unexpected error during subscription check:', err);
      
      const unexpectedErrorStatus = {
        ...initialStatus,
        isLoading: false,
        error: err.message || "Unknown server error",
        retryCount: status.retryCount + 1
      };
      
      setStatus(prev => unexpectedErrorStatus);
      logSubscriptionError('unexpected_error', err);
      
      return false;
    }
  }, [status.retryCount, cacheSubscriptionStatus, logSubscriptionError]);

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
      if (checkDevMode()) return;
      
      // Check user session
      const session = await checkUserSession();
      if (!session) return;
      
      // Check user access
      await checkUserAccess();
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
  }, [checkDevMode, checkUserSession, checkUserAccess, getCachedStatus, status.retryCount, logSubscriptionError]);

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
