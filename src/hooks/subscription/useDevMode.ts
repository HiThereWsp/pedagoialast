
import { SubscriptionStatus } from './types';

/**
 * Check if user is in development mode
 * @returns {boolean} True if in development mode
 */
export const checkDevWorkingMode = (setStatus: (status: SubscriptionStatus) => void): boolean => {
  if (import.meta.env.DEV) {
    console.log("Development mode detected 2, simulating active subscription");
    const devStatus = {
      isActive: false,
      type: 'dev_mode',
      expiresAt: null,
      isLoading: false,
      error: null,
      retryCount: 0
    };
    // Important - utiliser un setTimeout pour éviter les problèmes de mise à jour d'état en boucle
    setTimeout(() => {
      setStatus(devStatus);
    }, 0);
    return true;
  }
  return false;
};
