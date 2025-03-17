
import { SubscriptionStatus, initialStatus } from './types';
import { cacheSubscriptionStatus } from './useSubscriptionCache';

/**
 * Check if user is in development mode
 * @returns {boolean} True if in development mode
 */
export const checkDevMode = (setStatus: (status: SubscriptionStatus) => void): boolean => {
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
};
