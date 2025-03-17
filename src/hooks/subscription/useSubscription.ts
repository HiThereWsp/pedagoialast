
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubscriptionStatus, initialStatus, REFRESH_INTERVAL } from './types';
import { getCachedStatus, cacheSubscriptionStatus } from './useSubscriptionCache';
import { checkDevMode } from './useDevMode';
import { checkUserSession } from './useSessionCheck';
import { checkUserAccess } from './useAccessCheck';
import { useSubscriptionErrorHandling } from './useSubscriptionErrorHandling';

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  // Fonction de rappel pour checkSubscription définie en début pour useSubscriptionErrorHandling
  const checkSubscription = useCallback(async (force = false) => {
    // Si pas de force, vérifier le cache d'abord
    if (!force) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        console.log("Using cached subscription status", cachedStatus);
        setStatus(prev => ({
          ...cachedStatus,
          isLoading: false,
          error: null
        }));
        return;
      }
    }
    
    // Sinon, procéder à la vérification
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // En cas d'erreur pendant les vérifications, s'assurer que isLoading est correctement réinitialisé
    try {
      // Vérifier le mode développement d'abord (court-circuite les autres vérifications)
      if (checkDevMode(setStatus)) return;
      
      // Vérifier la session utilisateur
      const session = await checkUserSession(setStatus);
      if (!session) return;
      
      // Vérifier l'accès utilisateur
      await checkUserAccess(status, setStatus);
    } catch (error) {
      const criticalErrorStatus = errorHandler.handleSubscriptionError(error, status);
      setStatus(criticalErrorStatus);
    }
  }, [status]);

  // Utiliser le hook de gestion des erreurs
  const errorHandler = useSubscriptionErrorHandling(status, checkSubscription);

  // Vérifier l'abonnement au chargement du composant
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);
  
  // Actualiser périodiquement le statut de l'abonnement
  useEffect(() => {
    // Actualiser le statut toutes les 30 minutes
    const refreshInterval = setInterval(() => {
      console.log('Periodic subscription status refresh');
      checkSubscription(true); // Forcer une vérification complète
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
  }, [checkSubscription]);

  /**
   * Vérifier si l'utilisateur a un abonnement valide, sinon rediriger vers la page de tarification
   * @returns {boolean} True si l'utilisateur peut accéder à la fonctionnalité
   */
  const requireSubscription = useCallback(() => {
    if (status.isLoading) return true; // Attendre le chargement
    
    // Considérer les accès spéciaux comme valides
    if (status.type === 'beta' || status.type === 'dev_mode') return true;
    
    if (!status.isActive) {
      toast.error("Subscription required to access this feature");
      window.location.href = '/pricing';
      return false;
    }
    
    return true;
  }, [status]);

  return {
    isSubscribed: status.isActive,
    subscriptionType: status.type,
    expiresAt: status.expiresAt,
    isLoading: status.isLoading,
    error: status.error,
    checkSubscription,
    requireSubscription
  };
};
