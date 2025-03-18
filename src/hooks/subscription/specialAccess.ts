
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';
import { isSpecialBetaEmail, isSpecialBetaDomain } from './email-matchers';
import { processAmbassadorWelcome } from './ambassador-check';

/**
 * Check special user emails for immediate access
 * @returns {Promise<SubscriptionStatus | null>} Special status or null
 */
export const checkSpecialEmails = async (): Promise<SubscriptionStatus | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    const userId = data.session?.user?.id;
    
    if (!email) return null;
    
    // Check if user has a special beta email
    if (isSpecialBetaEmail(email)) {
      console.log("Beta email detected, providing immediate access:", email);
      return createBetaStatus();
    }
    
    // Check if user has a special beta domain
    if (isSpecialBetaDomain(email)) {
      console.log("Beta domain detected, providing immediate access:", email);
      
      // Process ambassador welcome email if needed
      if (userId) {
        await processAmbassadorWelcome(userId, email);
      }
      
      return createBetaStatus();
    }
  } catch (err) {
    console.error("Error checking special emails:", err);
  }
  
  return null;
};

/**
 * Create a beta status object
 */
function createBetaStatus(): SubscriptionStatus {
  return {
    isActive: true,
    type: 'beta',
    expiresAt: null,
    isLoading: false,
    error: null,
    retryCount: 0
  };
}
