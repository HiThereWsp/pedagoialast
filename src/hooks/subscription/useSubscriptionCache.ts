
import { SubscriptionStatus, CACHE_KEY, CACHE_DURATION } from './types';

/**
 * Cache subscription status in local storage
 */
export const cacheSubscriptionStatus = (statusToCache: SubscriptionStatus) => {
  try {
    // Only cache valid, non-loading, error-free statuses
    if (statusToCache.isLoading || statusToCache.error) {
      console.log('Not caching loading or error status:', statusToCache);
      return;
    }
    
    // Cache with timestamp for expiration tracking
    const cacheData = {
      ...statusToCache,
      timestamp: Date.now()
    };
    
    console.log('Caching subscription status:', cacheData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.log('Error caching status:', err);
    // Continue even if caching fails
  }
};

/**
 * Get cached subscription status
 * @returns {SubscriptionStatus|null} Cached status or null if no valid cache
 */
export const getCachedStatus = (): SubscriptionStatus | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('No cached subscription status found');
      return null;
    }
    
    const parsedCache = JSON.parse(cached) as SubscriptionStatus;
    
    // Check cache age
    if (parsedCache.timestamp) {
      const ageInMs = Date.now() - parsedCache.timestamp;
      
      if (ageInMs < CACHE_DURATION) {
        console.log(`Using cached subscription status (age: ${Math.round(ageInMs/1000)}s)`, parsedCache);
        return parsedCache;
      } else {
        console.log(`Cached subscription status expired (age: ${Math.round(ageInMs/1000)}s)`);
      }
    }
  } catch (err) {
    console.log('Error retrieving cache:', err);
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
    console.log('Error clearing cache:', err);
  }
};
