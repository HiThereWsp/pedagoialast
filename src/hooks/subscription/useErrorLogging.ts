
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
    
    await supabase.functions.invoke('log-subscription-error', {
      body: { errorType, details, userId: userId || 'anonymous' }
    }).catch(err => console.error('Failed to log error:', err));
  } catch (err) {
    console.error('Error logging:', err);
  }
};
