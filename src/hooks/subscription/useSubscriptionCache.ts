
import { SubscriptionStatus, CACHE_KEY, CACHE_DURATION } from './types';

/**
 * Cache subscription status in local storage
 */
export const cacheSubscriptionStatus = (statusToCache: SubscriptionStatus): void => {
  try {
    const cacheData = {
      ...statusToCache,
      timestamp: Date.now(),
      cachedUntil: Date.now() + CACHE_DURATION
    };
    
    // Special handling for ambassador accounts
    if (statusToCache.type === 'ambassador' && !cacheData.special_handling) {
      cacheData.special_handling = true;
    }
    
    if (statusToCache.type === 'ambassador' && statusToCache.ambassador_email) {
      cacheData.ambassador_email = statusToCache.ambassador_email;
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Subscription status cached until', new Date(cacheData.cachedUntil).toLocaleTimeString());
  } catch (err) {
    console.log('Error caching subscription status:', err);
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
    if (parsedCache.timestamp && parsedCache.cachedUntil) {
      if (Date.now() < parsedCache.cachedUntil) {
        console.log('Using cached subscription status, valid until', 
          new Date(parsedCache.cachedUntil).toLocaleTimeString());
        return parsedCache;
      } else {
        console.log('Cached subscription status expired at', 
          new Date(parsedCache.cachedUntil).toLocaleTimeString());
      }
    } else if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp) < CACHE_DURATION) {
      // Fallback for older cache format
      console.log('Using cached subscription status (legacy format)');
      return parsedCache;
    }
    
    console.log('Cached subscription status expired');
    return null;
  } catch (err) {
    console.log('Error retrieving cached subscription status:', err);
    return null;
  }
};

/**
 * Clear subscription cache
 */
export const clearSubscriptionCache = (): void => {
  try {
    // First log the current cache value for debugging
    const currentCache = localStorage.getItem(CACHE_KEY);
    if (currentCache) {
      console.log('Clearing subscription cache. Current value:', JSON.parse(currentCache));
    } else {
      console.log('Clearing subscription cache. No current cache exists.');
    }
    
    // Now remove the item from localStorage
    localStorage.removeItem(CACHE_KEY);
    
    // Double-check that it was removed
    const afterRemoval = localStorage.getItem(CACHE_KEY);
    if (afterRemoval) {
      console.error('Failed to clear subscription cache! Value still exists:', afterRemoval);
      
      // Try alternative clearing method
      try {
        localStorage.setItem(CACHE_KEY, '');
        localStorage.removeItem(CACHE_KEY);
        console.log('Attempted alternative cache clearing method');
      } catch (e) {
        console.error('Alternative clearing method also failed:', e);
      }
    } else {
      console.log('Subscription cache cleared successfully');
    }
  } catch (err) {
    console.error('Error clearing subscription cache:', err);
  }
};

/**
 * Force refresh subscription cache
 */
export const forceRefreshCache = (status: SubscriptionStatus): SubscriptionStatus => {
  const updatedStatus = {
    ...status,
    forceReload: true,
    timestamp: Date.now()
  };
  
  // Special handling for ambassador accounts to ensure they get proper access
  if (status.type === 'ambassador') {
    updatedStatus.special_handling = true;
  }
  
  clearSubscriptionCache();
  cacheSubscriptionStatus(updatedStatus);
  
  return updatedStatus;
};
