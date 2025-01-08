import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxRequests?: number;
  timeWindow?: number; // en millisecondes
}

export const useRateLimit = ({ maxRequests = 5, timeWindow = 60000 }: RateLimitConfig = {}) => {
  const [isLimited, setIsLimited] = useState(false);
  const requestCount = useRef(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const checkRateLimit = useCallback(() => {
    if (isLimited) return false;

    requestCount.current += 1;

    if (requestCount.current === 1) {
      // Réinitialiser le compteur après la fenêtre de temps
      resetTimeoutRef.current = setTimeout(() => {
        requestCount.current = 0;
        setIsLimited(false);
      }, timeWindow);
    }

    if (requestCount.current > maxRequests) {
      setIsLimited(true);
      return false;
    }

    return true;
  }, [isLimited, maxRequests, timeWindow]);

  return {
    isLimited,
    checkRateLimit,
  };
};