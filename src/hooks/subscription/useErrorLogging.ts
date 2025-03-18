
import { supabase } from '@/integrations/supabase/client';

/**
 * Log subscription errors
 * @param {string} errorType Error type
 * @param {any} details Error details
 */
export const logSubscriptionError = async (errorType: string, details: any) => {
  console.error(`Subscription error: ${errorType}`, details);
  
  try {
    // Log the error in your analytics/logging system
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Log to console first to ensure we have some trace
    console.error(`Subscription error for user ${userId || 'anonymous'}:`, {
      errorType,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Only try to invoke the function if we have a userId
    if (userId) {
      await supabase.functions.invoke('log-subscription-error', {
        body: { errorType, details, userId }
      }).catch(err => console.error('Failed to log error to function:', err));
    }
  } catch (err) {
    console.error('Error during error logging:', err);
  }
};
