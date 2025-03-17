
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
};

const initialStatus: SubscriptionStatus = {
  isActive: false,
  type: null,
  expiresAt: null,
  isLoading: true,
  error: null,
  retryCount: 0
};

/**
 * Hook personnalisé pour gérer l'état et la vérification des abonnements
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  /**
   * Vérifie si l'utilisateur est en mode développement
   * @returns {boolean} True si en mode développement
   */
  const checkDevMode = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Mode développement détecté, simulation d'un abonnement actif");
      setStatus({
        isActive: true,
        type: 'dev_mode',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      });
      return true;
    }
    return false;
  }, []);

  /**
   * Vérifie l'état de la session utilisateur
   * @returns {Promise<Session | null>} La session ou null si non authentifié
   */
  const checkUserSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error.message);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: `Erreur session: ${error.message}`
        }));
        return null;
      }
      
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
    } catch (err) {
      console.error("Exception lors de la vérification de session:", err);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: `Exception: ${err.message}`
      }));
      return null;
    }
  }, []);

  /**
   * Vérifie l'abonnement de l'utilisateur via la fonction check-user-access
   * @returns {Promise<boolean>} True si l'utilisateur a un abonnement actif
   */
  const checkUserAccess = useCallback(async () => {
    try {
      console.log("Appel de la fonction check-user-access");
      
      // Ajout de headers explicites pour résoudre les problèmes CORS
      const headers = {
        "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
        "Content-Type": "application/json",
      };
      
      const { data, error } = await supabase.functions.invoke('check-user-access', {
        headers: headers
      });
      
      if (error) {
        console.error('Erreur edge function:', error);
        
        // Message d'erreur plus descriptif selon le contexte
        const errorMessage = error.message && error.message.includes("enum") 
          ? "Erreur de configuration serveur (types manquants)" 
          : error.message || "Erreur inattendue";
        
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          retryCount: prev.retryCount + 1
        }));
        
        // Log détaillé pour aider au débogage
        console.error('Détails erreur vérification accès:', {
          message: error.message,
          name: error.name,
          status: error.status,
          stack: error.stack
        });
        
        return false;
      }
      
      console.log("Réponse check-user-access:", data);
      
      if (!data) {
        console.error("Aucune donnée reçue de check-user-access");
        setStatus({
          ...initialStatus,
          isLoading: false,
          error: "Réponse invalide du serveur",
          retryCount: status.retryCount + 1
        });
        return false;
      }
      
      setStatus({
        isActive: !!data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        retryCount: 0
      });
      
      return !!data.access;
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification de l\'abonnement:', err);
      
      setStatus(prev => ({
        ...initialStatus,
        isLoading: false,
        error: err.message || "Erreur serveur inconnue",
        retryCount: prev.retryCount + 1
      }));
      
      return false;
    }
  }, [status.retryCount]);

  /**
   * Fonction principale pour vérifier l'abonnement
   */
  const checkSubscription = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // En cas d'erreur lors des vérifications, assurer que isLoading est correctement réinitialisé
    try {
      // Vérifier le mode développement en priorité (court-circuite les autres vérifications)
      if (checkDevMode()) return;
      
      // Vérifier la session utilisateur
      const session = await checkUserSession();
      if (!session) return;
      
      // Vérifier l'accès utilisateur
      await checkUserAccess();
    } catch (error) {
      console.error("Erreur critique lors de la vérification d'abonnement:", error);
      setStatus(prev => ({
        ...initialStatus,
        isLoading: false,
        error: "Erreur critique: " + (error.message || "inconnue"),
        retryCount: prev.retryCount + 1
      }));
    }
  }, [checkDevMode, checkUserSession, checkUserAccess]);

  // Tentative automatique avec retard exponentiel en cas d'erreur
  useEffect(() => {
    if (status.error && status.retryCount < 3) {
      const retryDelay = Math.pow(2, status.retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Nouvel essai dans ${retryDelay/1000}s... (tentative ${status.retryCount + 1}/3)`);
      
      const retryTimer = setTimeout(() => {
        console.log(`Tentative de vérification #${status.retryCount + 1}`);
        checkSubscription();
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [status.error, status.retryCount, checkSubscription]);

  // Vérifier l'abonnement au chargement du composant
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  /**
   * Vérifie si l'utilisateur a un abonnement valide, sinon redirige vers la page d'abonnement
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
