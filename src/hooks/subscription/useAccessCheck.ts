
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
    
    // Vérification simplifiée pour les emails beta connus
    const checkKnownBetaEmail = async (): Promise<boolean> => {
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;
        
        if (email) {
          // Liste d'emails et de domaines qui ont accès beta
          const betaEmails = [
            'andyguitteaud@gmail.co', 
            'andyguitteaud@gmail.com',
            // Ajouter d'autres emails ici si nécessaire
          ];
          
          if (betaEmails.includes(email)) {
            console.log("Email beta connu détecté, accès accordé:", email);
            
            // Définir le statut d'abonnement beta
            const betaStatus = {
              isActive: true,
              type: 'beta',
              expiresAt: null,
              isLoading: false,
              error: null,
              retryCount: 0
            };
            
            setStatus(betaStatus);
            cacheSubscriptionStatus(betaStatus);
            return true;
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification d'email beta:", err);
      }
      return false;
    };
    
    // Si c'est un email beta connu, court-circuiter le reste de la vérification
    const isBetaEmail = await checkKnownBetaEmail();
    if (isBetaEmail) {
      return true;
    }
    
    // Add explicit headers to resolve CORS issues
    const headers = {
      "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
      "Content-Type": "application/json",
    };
    
    console.log("Sending request to check-user-access...");
    const startTime = performance.now();
    
    // Appel à notre fonction edge pour vérifier l'accès
    const { data, error } = await supabase.functions.invoke('check-user-access', {
      headers: headers
    });
    
    const duration = Math.round(performance.now() - startTime);
    console.log(`check-user-access response received in ${duration}ms:`, data);
    
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
      
      return false;
    }
    
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
    
    // Gestion spéciale pour les utilisateurs beta en attente
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
        retryCount: 0
      };
      
      setStatus(ambassadorStatus);
      cacheSubscriptionStatus(ambassadorStatus);
      return !!data.access;
    }
    
    // Gestion spéciale pour l'essai long de 200 jours
    if (data.type === 'trial_long' || (data.type === 'trial' && data.is_long_trial)) {
      console.log("Long trial user detected");
      const longTrialStatus = {
        isActive: !!data.access,
        type: 'trial_long',
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      setStatus(longTrialStatus);
      cacheSubscriptionStatus(longTrialStatus);
      return !!data.access;
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
