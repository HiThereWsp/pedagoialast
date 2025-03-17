
import { SubscriptionStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { posthog } from '@/integrations/posthog/client';

/**
 * Track non-subscribed user for marketing purposes
 */
export const trackNonSubscribedUser = async (status: SubscriptionStatus): Promise<void> => {
  if (!status.isActive && !status.isLoading && !status.error) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        // Log in PostHog
        posthog.capture('subscription_prompt_viewed', {
          user_id: user.id,
          source_page: window.location.pathname
        });
        
        // Record that the user saw the subscription message
        await supabase.from('user_events').insert({
          user_id: user.id,
          event_type: 'subscription_prompt_viewed',
          metadata: {
            source_page: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        });
        
        // Optional: Send to email marketing system (Brevo, etc.)
        await supabase.functions.invoke('create-brevo-contact', {
          body: {
            email: user.email,
            contactName: user.user_metadata?.first_name || 'Utilisateur',
            userType: "lead", // New type for prospects
            source: "app_signup"
          }
        });
      }
    } catch (err) {
      console.error("Error tracking non-subscribed user:", err);
      // Don't block UI in case of error
    }
  }
};
