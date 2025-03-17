
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';

/**
 * Check user access via check-user-access function
 * @returns {Promise<boolean>} True if user has active subscription
 */
export const checkUserAccess = async (
  status: SubscriptionStatus,
  setStatus: (status: SubscriptionStatus) => void
): Promise<boolean> => {
  try {
    console.log("Calling check-user-access function");
    
    // Add explicit headers to resolve CORS issues
    const headers = {
      "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
      "Content-Type": "application/json",
    };
    
    console.log("Sending request to check-user-access...");
    const startTime = performance.now();
    
    const { data, error } = await supabase.functions.invoke('check-user-access', {
      headers: headers
    });
    
    const duration = Math.round(performance.now() - startTime);
    console.log(`check-user-access response received in ${duration}ms`);
    
    if (error) {
      console.error('Edge function error:', error);
      
      // More descriptive error message based on context
      const errorMessage = error.message && error.message.includes("enum") 
        ? "Server configuration error (missing types)" 
        : error.message || "Unexpected error";
      
      const errorStatus = {
        ...initialStatus,
        isLoading: false,
        error: errorMessage,
        retryCount: status.retryCount + 1
      };
      
      setStatus(errorStatus);
      logSubscriptionError('check_access_error', { error, message: errorMessage });
      
      // Detailed log to help with debugging
      console.error('Error details during access check:', {
        message: error.message,
        name: error.name,
        status: error.status,
        stack: error.stack
      });
      
      return false;
    }
    
    console.log("Response from check-user-access:", data);
    
    if (!data) {
      console.error("No data received from check-user-access");
      
      const invalidResponseStatus = {
        ...initialStatus,
        isLoading: false,
        error: "Invalid response from server",
        retryCount: status.retryCount + 1
      };
      
      setStatus(invalidResponseStatus);
      logSubscriptionError('invalid_response', { data });
      return false;
    }
    
    // Valid subscription status
    const validStatus = {
      isActive: !!data.access,
      type: data.type || null,
      expiresAt: data.expires_at || null,
      isLoading: false,
      error: null,
      retryCount: 0
    };
    
    console.log("Setting validated subscription status:", validStatus);
    setStatus(validStatus);
    
    // Cache valid status
    cacheSubscriptionStatus(validStatus);
    
    return !!data.access;
  } catch (err) {
    console.error('Unexpected error during subscription check:', err);
    
    const unexpectedErrorStatus = {
      ...initialStatus,
      isLoading: false,
      error: err.message || "Unknown server error",
      retryCount: status.retryCount + 1
    };
    
    setStatus(unexpectedErrorStatus);
    logSubscriptionError('unexpected_error', err);
    
    return false;
  }
};
