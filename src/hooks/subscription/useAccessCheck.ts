
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
    
    // Vérification simplifiée pour les emails beta et ambassadeur connus
    const checkSpecialEmails = async (): Promise<SubscriptionStatus | null> => {
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
            special_handling: true
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
    
    // Set a timeout for the function call to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("check-user-access timeout")), 8000);
    });
    
    // Call edge function with timeout
    const responsePromise = supabase.functions.invoke('check-user-access', {
      headers: headers
    });
    
    // Race the function call against the timeout
    const { data, error } = await Promise.race([
      responsePromise,
      timeoutPromise.then(() => {
        throw new Error("check-user-access timed out after 8 seconds");
      })
    ]) as any;
    
    const duration = Math.round(performance.now() - startTime);
    console.log(`check-user-access response received in ${duration}ms:`, data);
    
    if (error) {
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
    
    if (!data) {
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
      logSubscriptionError('invalid_response', { data });
      return false;
    }
    
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
  } catch (err) {
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
};
