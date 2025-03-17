
export type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  timestamp?: number;
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
export const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
export const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
