
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { Session } from '@supabase/supabase-js';

/**
 * Check user session state
 * @returns {Promise<Session | null>} Session or null if not authenticated
 */
export const checkUserSession = async (setStatus: (status: SubscriptionStatus) => void): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error retrieving session:", error.message);
      
      const errorStatus = {
        ...initialStatus,
        isLoading: false,
        error: `Session error: ${error.message}`
      };
      
      setStatus(errorStatus);
      logSubscriptionError('session_error', error);
      return null;
    }
    
    if (!session) {
      console.log("No session found in useSubscription");
      
      const noSessionStatus = {
        ...initialStatus,
        isLoading: false,
        error: 'Not authenticated'
      };
      
      setStatus(noSessionStatus);
      return null;
    }
    
    return session;
  } catch (err) {
    console.error("Exception during session check:", err);
    
    const exceptionStatus = {
      ...initialStatus,
      isLoading: false,
      error: `Exception: ${err.message}`
    };
    
    setStatus(exceptionStatus);
    logSubscriptionError('session_exception', err);
    return null;
  }
};
