
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { posthog } from '@/integrations/posthog/client';

export function PricingPageTracking() {
  const { user } = useAuth();

  useEffect(() => {
    const trackPricingVisit = async () => {
      if (!user) return;
      
      try {
        // 1. Log in PostHog
        posthog.capture('pricing_page_viewed', {
          user_id: user.id,
          source: document.referrer
        });
        
        // 2. Record the visit in the database
        await supabase.from('user_events').insert({
          user_id: user.id,
          event_type: 'pricing_page_viewed',
          metadata: {
            source: document.referrer,
            timestamp: new Date().toISOString()
          }
        });
        
        // 3. Update status in Brevo (for targeted email campaigns)
        await supabase.functions.invoke('create-brevo-contact', {
          body: {
            email: user.email,
            contactName: user.user_metadata?.first_name || 'Utilisateur',
            userType: "interested_lead", // Prospect qui a montré de l'intérêt
            source: "pricing_page"
          }
        });
        
      } catch (error) {
        console.error("Erreur lors du tracking de la visite de la page pricing:", error);
      }
    };
    
    // Execute with a slight delay to avoid impacting initial loading
    const timeoutId = setTimeout(() => {
      trackPricingVisit();
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [user]);
  
  // This component doesn't render anything visually
  return null;
}
