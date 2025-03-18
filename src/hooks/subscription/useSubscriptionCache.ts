
import { SubscriptionStatus, CACHE_KEY, CACHE_DURATION } from './types';

/**
 * Cache subscription status in local storage with improved error handling
 */
export const cacheSubscriptionStatus = (statusToCache: SubscriptionStatus) => {
  try {
    // Only cache valid, non-loading, error-free statuses
    if (statusToCache.isLoading || statusToCache.error) {
      console.log('Not caching loading or error status:', statusToCache);
      return;
    }
    
    // Ensure we have an ambassador status specially marked for ag.tradeunion@gmail.com
    const specialEmailHandling = handleSpecialAmbassadorEmails(statusToCache);
    
    // Cache with timestamp and explicit expiration for better tracking
    const cacheData = {
      ...specialEmailHandling,
      timestamp: Date.now(),
      cachedUntil: Date.now() + CACHE_DURATION
    };
    
    console.log('Caching subscription status:', cacheData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.error('Error caching status:', err);
    // Continue even if caching fails
  }
};

/**
 * Special handling for known ambassador emails
 */
const handleSpecialAmbassadorEmails = (status: SubscriptionStatus): SubscriptionStatus => {
  // Get the current user's email
  try {
    const userDataStr = localStorage.getItem('supabase.auth.token');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      const email = userData?.currentSession?.user?.email;
      
      // Special case for known ambassador
      if (email === 'ag.tradeunion@gmail.com') {
        console.log('Special ambassador email detected, ensuring proper cache data');
        return {
          ...status,
          isActive: true,
          type: 'ambassador',
          expiresAt: new Date('2025-08-28').toISOString(),
          ambassador_email: email, // Add this marker
          special_handling: true // Add this marker
        };
      }
    }
  } catch (err) {
    console.error('Error in special ambassador email handling:', err);
  }
  
  return status;
};

/**
 * Get cached subscription status with improved validation
 * @returns {SubscriptionStatus|null} Cached status or null if no valid cache
 */
export const getCachedStatus = (): SubscriptionStatus | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('No cached subscription status found');
      return null;
    }
    
    const parsedCache = JSON.parse(cached) as SubscriptionStatus & { 
      timestamp?: number,
      cachedUntil?: number,
      ambassador_email?: string,
      special_handling?: boolean
    };
    
    // First check for special ambassador email handling
    if (parsedCache.special_handling && parsedCache.ambassador_email === 'ag.tradeunion@gmail.com') {
      console.log('Using special ambassador cached status');
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
    
    // Check cache age
    if (parsedCache.timestamp) {
      const ageInMs = Date.now() - parsedCache.timestamp;
      const isExpired = parsedCache.cachedUntil ? Date.now() > parsedCache.cachedUntil : ageInMs >= CACHE_DURATION;
      
      if (!isExpired) {
        console.log(`Using cached subscription status (age: ${Math.round(ageInMs/1000)}s)`, parsedCache);
        
        // Clean up timestamp for return 
        const cleanCache: SubscriptionStatus = {
          isActive: parsedCache.isActive,
          type: parsedCache.type,
          expiresAt: parsedCache.expiresAt,
          isLoading: false, // Always reset to false when using cache
          error: null,      // Always reset to null when using cache
          retryCount: 0,     // Reset retry counter
          previousType: parsedCache.previousType,
          special_handling: parsedCache.special_handling
        };
        
        return cleanCache;
      } else {
        console.log(`Cached subscription status expired (age: ${Math.round(ageInMs/1000)}s)`);
      }
    }
  } catch (err) {
    console.error('Error retrieving cache:', err);
  }
  
  return null;
};

/**
 * Force clear the subscription cache
 */
export const clearSubscriptionCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Subscription cache cleared');
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
};
