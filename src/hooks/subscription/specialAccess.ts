
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
