
import { useEffect } from 'react';
import { posthog } from '@/integrations/posthog/client';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export const useSubscriptionEvents = () => {
  const { isSubscribed, subscriptionType } = useSubscription();
  const { user } = useAuth();
  
  // Track subscription changes
  useEffect(() => {
    if (!user || !isSubscribed) return;
    
    // Check if first login event was already tracked
    const hasTrackedFirstLogin = localStorage.getItem('premium_first_login_tracked');
    
    if (!hasTrackedFirstLogin && isSubscribed) {
      // Track first login after subscription
      posthog.capture('premium_first_login', {
        subscription_type: subscriptionType,
        user_id: user.id,
      });
      
      // Record the event in Supabase
      supabase.from('user_events').insert({
        user_id: user.id,
        event_type: 'premium_first_login',
        metadata: {
          subscription_type: subscriptionType,
          timestamp: new Date().toISOString()
        }
      }).then(({ error }) => {
        if (error) {
          console.error('Error recording premium first login event:', error);
        }
      });
      
      // Mark as tracked in localStorage
      localStorage.setItem('premium_first_login_tracked', 'true');
    }
  }, [isSubscribed, subscriptionType, user]);
  
  return {
    isSubscribed,
    subscriptionType
  };
};
