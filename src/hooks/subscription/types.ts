
export type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  timestamp?: number;
  previousType?: string | null;
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
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds (increased from 10 minutes)
export const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds (increased from 30 minutes)
