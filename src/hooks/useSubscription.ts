
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialStatus: SubscriptionStatus = {
  isActive: false,
  type: null,
  expiresAt: null,
  isLoading: true,
  error: null
};

/**
 * Hook personnalisé pour gérer l'état et la vérification des abonnements
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  /**
   * Vérifie si l'utilisateur est en mode développement
   */
  const checkDevMode = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Mode développement détecté, simulation d'un abonnement actif");
      setStatus({
        isActive: true,
        type: 'dev_mode',
        expiresAt: null,
        isLoading: false,
        error: null
      });
      return true;
    }
    return false;
  }, []);

  /**
   * Vérifie l'état de la session utilisateur
   */
  const checkUserSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("Aucune session trouvée dans useSubscription");
      setStatus({
        ...initialStatus,
        isLoading: false,
        error: 'Non authentifié'
      });
      return null;
    }
    
    return session;
  }, []);

  /**
   * Vérifie l'abonnement de l'utilisateur via la fonction check-user-access
   */
  const checkUserAccess = useCallback(async () => {
    try {
      console.log("Appel de la fonction check-user-access");
      const { data, error } = await supabase.functions.invoke('check-user-access');
      
      if (error) {
        console.error('Erreur vérification accès:', error);
        setStatus({
          ...initialStatus,
          isLoading: false,
          error: error.message
        });
        return false;
      }
      
      console.log("Réponse check-user-access:", data);
      setStatus({
        isActive: data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null
      });
      
      return data.access;
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification de l\'abonnement:', err);
      setStatus({
        ...initialStatus,
        isLoading: false,
        error: err.message
      });
      return false;
    }
  }, []);

  /**
   * Fonction principale pour vérifier l'abonnement
   */
  const checkSubscription = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Vérifier le mode développement en priorité
    if (checkDevMode()) return;
    
    // Vérifier la session utilisateur
    const session = await checkUserSession();
    if (!session) return;
    
    // Vérifier l'accès utilisateur
    await checkUserAccess();
  }, [checkDevMode, checkUserSession, checkUserAccess]);

  // Vérifier l'abonnement au chargement du composant
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  /**
   * Vérifie si l'utilisateur a un abonnement valide, sinon redirige vers la page d'abonnement
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
