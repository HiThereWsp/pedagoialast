
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';

/**
 * Check special user emails for immediate access
 * @returns {Promise<SubscriptionStatus | null>} Special status or null
 */
export const checkSpecialEmails = async (): Promise<SubscriptionStatus | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    
    if (!email) return null;
    
    // Special case for known ambassador
    if (email === 'ag.tradeunion@gmail.com') {
      console.log("Special ambassador email detected, providing immediate access:", email);
      
      const ambassadorStatus = {
        isActive: true,
        type: 'ambassador',
        expiresAt: new Date('2025-08-28').toISOString(),
        isLoading: false,
        error: null,
        retryCount: 0,
        special_handling: true,
        ambassador_email: email
      };
      
      // Try to update database but don't block on it
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) {
          await supabase.from('user_subscriptions')
            .upsert({
              user_id: user.id,
              type: 'ambassador',
              status: 'active',
              expires_at: new Date('2025-08-28').toISOString(),
            }, {
              onConflict: 'user_id'
            });
          console.log("Ambassador subscription data updated in database");
        }
      } catch (dbErr) {
        console.error("Error updating ambassador subscription in database:", dbErr);
        // Continue despite error
      }
      
      return ambassadorStatus;
    }
    
    // Beta email list
    const betaEmails = [
      'andyguitteaud@gmail.co', 
      'andyguitteaud@gmail.com',
    ];
    
    if (betaEmails.includes(email)) {
      console.log("Beta email detected, providing immediate access:", email);
      
      const betaStatus = {
        isActive: true,
        type: 'beta',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      return betaStatus;
    }
    
    // Beta domains
    const betaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
    const emailDomain = email.split('@')[1];
    
    if (betaDomains.includes(emailDomain)) {
      console.log("Beta domain detected, providing immediate access:", emailDomain);
      
      const betaStatus = {
        isActive: true,
        type: 'beta',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      return betaStatus;
    }
  } catch (err) {
    console.error("Error checking special emails:", err);
  }
  
  return null;
};
