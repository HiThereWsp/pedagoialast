
import { SubscriptionStatus, CACHE_KEY, CACHE_DURATION } from './types';

/**
 * Cache subscription status in local storage
 */
export const cacheSubscriptionStatus = (statusToCache: SubscriptionStatus): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...statusToCache,
      timestamp: Date.now()
    }));
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
};
