
export type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  timestamp?: number;
  previousType?: string | null;
  forceReload?: boolean; // Add this flag to handle forced reloads
  cachedUntil?: number; // Add explicit cache expiration timestamp
};

export const initialStatus: SubscriptionStatus = {
  isActive: false,
  type: null,
  expiresAt: null,
  isLoading: true,
  error: null,
  retryCount: 0
};

// Constants for cache management
export const CACHE_KEY = 'subscription_status';
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
export const VERIFICATION_TIMEOUT = 10 * 1000; // 10 seconds timeout for verification
