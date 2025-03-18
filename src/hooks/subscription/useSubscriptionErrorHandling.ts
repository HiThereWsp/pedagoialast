
import { useState, useEffect } from 'react';
import { SubscriptionStatus } from './types';
import { logSubscriptionError } from './useErrorLogging';
import { clearSubscriptionCache } from './useSubscriptionCache';

/**
 * Hook pour gérer les erreurs et les retries pour l'abonnement
 */
export const useSubscriptionErrorHandling = (
  status: SubscriptionStatus,
  setStatus: React.Dispatch<React.SetStateAction<SubscriptionStatus>>
) => {
  // Gestion des retries automatiques avec délai exponentiel et limitation des tentatives
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;
    
    if (status.error && status.retryCount < 3) {
      const retryDelay = Math.pow(2, status.retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${retryDelay/1000}s... (attempt ${status.retryCount + 1}/3)`);
      
      retryTimer = setTimeout(() => {
        console.log(`Attempting check #${status.retryCount + 1}`);
        // Clear cache before retry to prevent using stale data
        clearSubscriptionCache();
        // Update status to trigger a new check
        setStatus(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          isLoading: true,
          error: null
        }));
      }, retryDelay);
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [status.error, status.retryCount, setStatus]);

  /**
   * Gère une erreur lors de la vérification de l'abonnement
   */
  const handleSubscriptionError = (error: Error, currentStatus: SubscriptionStatus) => {
    console.error("Critical error during subscription check:", error);
    
    // Vérification des domaines d'e-mail beta
    const checkBetaEmail = (email?: string): boolean => {
      if (!email) return false;
      
      const specialBetaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
      const specialBetaEmails = ['andyguitteaud@gmail.com', 'ag.tradeunion@gmail.com']; // Added ambassador email
      
      if (specialBetaEmails.includes(email)) {
        console.log('Adresse email beta détectée:', email);
        return true;
      }
      
      const emailDomain = email.split('@')[1];
      if (specialBetaDomains.includes(emailDomain)) {
        console.log('Domaine email beta détecté:', emailDomain);
        return true;
      }
      
      return false;
    };
    
    // Vérification de l'état d'authentification actuel
    const checkCurrentAuth = async (): Promise<boolean> => {
      try {
        const auth = await import('@/integrations/supabase/client');
        const { data } = await auth.supabase.auth.getSession();
        
        if (data.session?.user?.email) {
          return checkBetaEmail(data.session.user.email);
        }
      } catch (e) {
        console.error("Erreur lors de la vérification de l'authentification:", e);
      }
      return false;
    };
    
    // Vérifier si l'utilisateur est un bêta-testeur connu
    checkCurrentAuth().then(isBeta => {
      if (isBeta) {
        console.log("Utilisateur beta détecté, accès accordé malgré l'erreur");
        setStatus({
          isActive: true,
          type: 'beta',
          expiresAt: null,
          isLoading: false,
          error: null,
          retryCount: 0
        });
      } else {
        // Si l'utilisateur n'est pas un beta testeur connu, enregistrer l'erreur
        const criticalErrorStatus = {
          ...currentStatus,
          isLoading: false,
          error: "Erreur critique: " + (error.message || "inconnue"),
          retryCount: currentStatus.retryCount + 1
        };
        
        logSubscriptionError('critical_error', error);
        setStatus(criticalErrorStatus);
      }
    });
    
    // Return the current status to maintain consistency
    return currentStatus;
  };

  return {
    handleSubscriptionError
  };
};
