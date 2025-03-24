
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';
import { checkSpecialEmails } from './specialAccess';
import { withTimeout, hasAdminAccess } from './accessUtils';

/**
 * Check user access via check-user-access function with prioritization
 * @returns {Promise<boolean>} True if user has active subscription
 */
export const checkUserAccess = async (
  status: SubscriptionStatus,
  setStatus: (status: SubscriptionStatus) => void
): Promise<boolean> => {
  try {
    // Check development mode first (only for dev environment)
    if (import.meta.env.DEV) {
      console.log("Development mode detectedaa, simulating active subscription");
      const devStatus = {
        isActive: true,
        type: 'a',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      setStatus(devStatus);
      cacheSubscriptionStatus(devStatus);
      return true;
    }
    
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email;
    
    // Override for special admin accounts
    if (email && hasAdminAccess(email)) {
      console.log(`Admin access override for ${email}`);
      const adminStatus = {
        isActive: true,
        type: 'admin',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0,
        special_handling: true
      };
      setStatus(adminStatus);
      cacheSubscriptionStatus(adminStatus);
      return true;
    }
    
    console.log("Calling check-user-access function");
    
    // Add explicit headers to resolve CORS issues
    const headers = {
      "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
      "Content-Type": "application/json",
    };
    
    console.log("Sending request to check-user-access...");
    const startTime = performance.now();
    
    // Call edge function with timeout
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke('check-user-access', { headers }),
        8000,
        "check-user-access timed out after 8 seconds"
      );
      
      const duration = Math.round(performance.now() - startTime);
      console.log(`check-user-access response received in ${duration}ms:`, data);
      
      if (error) {
        // If the edge function fails, fall back to special access checks
        console.error('Edge function error:', error);
        const fallbackStatus = await checkSpecialEmails();
        if (fallbackStatus) {
          console.log("Using fallback special status after edge function error");
          setStatus(fallbackStatus);
          cacheSubscriptionStatus(fallbackStatus);
          return true;
        }
        
        // If no special access, set error status
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
        return false;
      }
      
      if (!data) {
        // If no data returned, fall back to special access checks
        console.error("No data received from check-user-access");
        const fallbackStatus = await checkSpecialEmails();
        if (fallbackStatus) {
          console.log("Using fallback special status after no data response");
          setStatus(fallbackStatus);
          cacheSubscriptionStatus(fallbackStatus);
          return true;
        }
        
        // If no special access, set invalid response status
        const invalidResponseStatus = {
          ...initialStatus,
          isLoading: false,
          error: "Invalid response from server",
          retryCount: status.retryCount + 1
        };
        
        setStatus(invalidResponseStatus);
        logSubscriptionError('invalid_response', { data: null });
        return false;
      }
      
      // Handle various subscription types with priority logic
      
      // Handle paid subscription (highest priority)
      if (data.type === 'paid') {
        const paidStatus = {
          isActive: !!data.access,
          type: 'paid',
          expiresAt: data.expires_at || null,
          isLoading: false,
          error: null,
          retryCount: 0,
          previousType: status.type
        };
        
        console.log("Paid subscription status found:", paidStatus);
        setStatus(paidStatus);
        cacheSubscriptionStatus(paidStatus);
        return !!data.access;
      }
      
      // Handle trial subscription (second priority)
      if (data.type === 'trial') {
        const trialStatus = {
          isActive: !!data.access,
          type: 'trial',
          expiresAt: data.expires_at || null,
          isLoading: false,
          error: null,
          retryCount: 0,
          previousType: status.type
        };
        
        console.log("Trial subscription status found:", trialStatus);
        setStatus(trialStatus);
        cacheSubscriptionStatus(trialStatus);
        return !!data.access;
      }
      
      // Handle ambassador subscription (third priority)
      if (data.type === 'ambassador') {
        const ambassadorStatus = {
          isActive: !!data.access,
          type: 'ambassador',
          expiresAt: data.expires_at || null,
          isLoading: false,
          error: null,
          retryCount: 0,
          previousType: status.type,
          special_handling: true
        };
        
        console.log("Ambassador status found:", ambassadorStatus);
        setStatus(ambassadorStatus);
        cacheSubscriptionStatus(ambassadorStatus);
        return !!data.access;
      }
      
      // Handle beta subscription (fourth priority)
      if (data.type === 'beta') {
        const betaStatus = {
          isActive: !!data.access,
          type: 'beta',
          expiresAt: data.expires_at || null,
          isLoading: false,
          error: null,
          retryCount: 0,
          previousType: status.type
        };
        
        console.log("Beta status found:", betaStatus);
        setStatus(betaStatus);
        cacheSubscriptionStatus(betaStatus);
        return !!data.access;
      }
      
      // Handle beta_pending status
      if (data.type === 'beta_pending') {
        console.log("Beta user pending validation detected");
        const pendingBetaStatus = {
          isActive: false,
          type: 'beta_pending',
          expiresAt: null,
          isLoading: false,
          error: null,
          retryCount: 0
        };
        
        setStatus(pendingBetaStatus);
        cacheSubscriptionStatus(pendingBetaStatus);
        return false;
      }
      
      // Generic subscription status for any other type
      const validStatus = {
        isActive: !!data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        retryCount: 0,
        previousType: status.type
      };
      
      console.log("Setting validated subscription status:", validStatus);
      setStatus(validStatus);
      cacheSubscriptionStatus(validStatus);
      return !!data.access;
      
    } catch (timeoutErr) {
      console.error('Edge function timeout:', timeoutErr);
      
      // Fall back to special access checks on timeout
      const fallbackStatus = await checkSpecialEmails();
      if (fallbackStatus) {
        console.log("Using fallback special status after timeout");
        setStatus(fallbackStatus);
        cacheSubscriptionStatus(fallbackStatus);
        return true;
      }
      
      // If no special access, set timeout error status
      const timeoutStatus = {
        ...initialStatus,
        isLoading: false,
        error: "Server timeout: Please try again later",
        retryCount: status.retryCount + 1
      };
      
      setStatus(timeoutStatus);
      logSubscriptionError('timeout_error', { error: timeoutErr });
      return false;
    }
  } catch (err) {
    // Handle unexpected errors
    console.error('Unexpected error during subscription check:', err);
    
    // Fall back to special access checks
    try {
      const fallbackStatus = await checkSpecialEmails();
      if (fallbackStatus) {
        console.log("Using fallback special status after exception");
        setStatus(fallbackStatus);
        cacheSubscriptionStatus(fallbackStatus);
        return true;
      }
    } catch (checkErr) {
      console.error("Error checking special emails after exception:", checkErr);
    }
    
    // If no special access, set unexpected error status
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
