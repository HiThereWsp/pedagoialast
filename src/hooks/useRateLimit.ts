import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxRequests?: number;
  timeWindow?: number; // en millisecondes
}

export const useRateLimit = ({ maxRequests = 5, timeWindow = 60000 }: RateLimitConfig = {}) => {
  const [isLimited, setIsLimited] = useState(false);
  const requestCount = useRef(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const checkRateLimit = useCallback(async () => {
    if (isLimited) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: usageData, error } = await supabase
        .from('image_generation_usage')
        .select('monthly_generation_count')
        .eq('user_id', user.id)
        .eq('generation_month', new Date().toISOString().slice(0, 7) + '-01')
        .single();

      if (error) {
        console.error('Error checking rate limit:', error);
        return false;
      }

      const currentCount = usageData?.monthly_generation_count || 0;
      
      if (currentCount >= maxRequests) {
        setIsLimited(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in checkRateLimit:', error);
      return false;
    }
  }, [isLimited, maxRequests]);

  return {
    isLimited,
    checkRateLimit,
  };
};