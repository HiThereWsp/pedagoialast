
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubscriptionStatus, initialStatus, REFRESH_INTERVAL } from './types';
import { getCachedStatus, cacheSubscriptionStatus, clearSubscriptionCache } from './useSubscriptionCache';
import { checkDevMode } from './useDevMode';
import { checkUserSession } from './useSessionCheck';
import { checkUserAccess } from './useAccessCheck';
import { useSubscriptionErrorHandling } from './useSubscriptionErrorHandling';

/**
 * Custom hook to manage subscription state and verification
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  // Ajouter un flag pour éviter les vérifications multiples
  const [isChecking, setIsChecking] = useState(false);

  // Utiliser le hook de gestion des erreurs - placer en haut pour respecter les règles des hooks
  const errorHandler = useSubscriptionErrorHandling(status, setStatus);

  // Fonction de rappel pour checkSubscription définie avec les bonnes dépendances
  const checkSubscription = useCallback(async (force = false) => {
    // Prévenir les vérifications multiples simultanées
    if (isChecking && !force) {
      console.log("Une vérification est déjà en cours, ignorée");
      return;
    }
    
    // Si pas de force, vérifier le cache d'abord
    if (!force) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        console.log("Using cached subscription status", cachedStatus);
        setStatus(cachedStatus);
        return;
      }
    }
    
    // Sinon, procéder à la vérification
    setIsChecking(true); // Marquer comme en cours de vérification
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // En cas d'erreur pendant les vérifications, s'assurer que isLoading est correctement réinitialisé
    try {
      // Vérifier le mode développement d'abord (court-circuite les autres vérifications)
      if (checkDevMode(setStatus)) {
        setIsChecking(false);
        return;
      }
      
      // Vérifier la session utilisateur
      const session = await checkUserSession(setStatus);
      if (!session) {
        setIsChecking(false);
        return;
      }
      
      // Vérifier l'accès utilisateur
      await checkUserAccess(status, setStatus);
    } catch (error) {
      errorHandler.handleSubscriptionError(error, status);
    } finally {
      setIsChecking(false);
    }
  }, [status, isChecking, errorHandler]);

  // Vérifier l'abonnement au chargement du composant, une seule fois
  useEffect(() => {
    let mounted = true;
    
    // Utiliser un setTimeout pour éviter les problèmes de rendu
    const timer = setTimeout(() => {
      if (mounted) {
        checkSubscription();
      }
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
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
      toast.error("Abonnement requis pour accéder à cette fonctionnalité");
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
