
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';
import { checkSpecialEmails } from './specialAccess';
import { withTimeout } from './accessUtils';

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
    
    // Check for special emails first (short-circuit full verification)
    const specialStatus = await checkSpecialEmails();
    if (specialStatus) {
      console.log("Special status found, skipping regular verification");
      setStatus(specialStatus);
      cacheSubscriptionStatus(specialStatus);
      return true;
    }
    
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
        return await handleAccessCheckError(error, status, setStatus);
      }
      
      if (!data) {
        return await handleInvalidResponse(status, setStatus);
      }
      
      return await handleValidResponse(data, status, setStatus);
      
    } catch (timeoutErr) {
      console.error('Edge function timeout:', timeoutErr);
      return await handleAccessCheckError(timeoutErr, status, setStatus);
    }
  } catch (err) {
    return await handleUnexpectedError(err, status, setStatus);
  }
};

// Helper functions to process different response scenarios
async function handleAccessCheckError(error: any, status: SubscriptionStatus, setStatus: (status: SubscriptionStatus) => void): Promise<boolean> {
  console.error('Edge function error:', error);
  
  // Try special email handling as fallback
  const fallbackStatus = await checkSpecialEmails();
  if (fallbackStatus) {
    console.log("Using fallback special status after edge function error");
    setStatus(fallbackStatus);
    cacheSubscriptionStatus(fallbackStatus);
    return true;
  }
  
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
  
  return false;
}

async function handleInvalidResponse(status: SubscriptionStatus, setStatus: (status: SubscriptionStatus) => void): Promise<boolean> {
  console.error("No data received from check-user-access");
  
  // Try special email handling as fallback
  const fallbackStatus = await checkSpecialEmails();
  if (fallbackStatus) {
    console.log("Using fallback special status after no data response");
    setStatus(fallbackStatus);
    cacheSubscriptionStatus(fallbackStatus);
    return true;
  }
  
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

async function handleValidResponse(data: any, status: SubscriptionStatus, setStatus: (status: SubscriptionStatus) => void): Promise<boolean> {
  // Gestion spéciale pour les utilisateurs beta en attente de validation
  if (data.type === 'beta_pending') {
    console.log("Beta user pending validation detected");
    const pendingBetaStatus = {
      isActive: false, // Important: ils n'ont pas encore accès complet
      type: 'beta_pending',
      expiresAt: null,
      isLoading: false,
      error: null,
      retryCount: 0
    };
    
    setStatus(pendingBetaStatus);
    cacheSubscriptionStatus(pendingBetaStatus);
    return false; // Ils n'ont pas encore un accès complet
  }
  
  // Gestion spéciale pour les ambassadeurs
  if (data.type === 'ambassador') {
    console.log("Ambassador user detected");
    const ambassadorStatus = {
      isActive: !!data.access,
      type: 'ambassador',
      expiresAt: data.expires_at || null,
      isLoading: false,
      error: null,
      retryCount: 0,
      previousType: status.type
    };
    
    setStatus(ambassadorStatus);
    cacheSubscriptionStatus(ambassadorStatus);
    return !!data.access;
  }
  
  // Valid subscription status
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
  
  // Cache valid status
  cacheSubscriptionStatus(validStatus);
  
  return !!data.access;
}

async function handleUnexpectedError(err: any, status: SubscriptionStatus, setStatus: (status: SubscriptionStatus) => void): Promise<boolean> {
  console.error('Unexpected error during subscription check:', err);
  
  // Try special email handling as fallback for any error
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
