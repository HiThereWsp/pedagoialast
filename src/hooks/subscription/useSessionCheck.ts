
import { SubscriptionStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';

/**
 * Check user session state
 * @returns {Promise<Session | null>} Session or null if not authenticated
 */
export const checkUserSession = async (
  setStatus: React.Dispatch<React.SetStateAction<SubscriptionStatus>>
) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error retrieving session:", error.message);
      
      const errorStatus: SubscriptionStatus = {
        isActive: false,
        type: null,
        expiresAt: null,
        isLoading: false,
        error: `Session error: ${error.message}`,
        retryCount: 0
      };
      
      setStatus(errorStatus);
      logSubscriptionError('session_error', error);
      return null;
    }
    
    if (!session) {
      console.log("No session found in useSubscription");
      
      const noSessionStatus: SubscriptionStatus = {
        isActive: false,
        type: null,
        expiresAt: null,
        isLoading: false,
        error: 'Not authenticated',
        retryCount: 0
      };
      
      setStatus(noSessionStatus);
      return null;
    }
    
    // Special case for ambassador email
    if (session.user.email === 'ag.tradeunion@gmail.com') {
      console.log("Ambassador email detected, setting special status");
      
      const ambassadorStatus: SubscriptionStatus = {
        isActive: true,
        type: 'ambassador',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      setStatus(ambassadorStatus);
    }
    
    return session;
  } catch (err) {
    console.error("Exception during session check:", err);
    
    const exceptionStatus: SubscriptionStatus = {
      isActive: false,
      type: null,
      expiresAt: null,
      isLoading: false,
      error: `Exception: ${err.message}`,
      retryCount: 0
    };
    
    setStatus(exceptionStatus);
    logSubscriptionError('session_exception', err);
    return null;
  }
};
