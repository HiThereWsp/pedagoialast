
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
  timestamp?: number;
};

const initialStatus: SubscriptionStatus = {
  isActive: false,
  type: null,
  expiresAt: null,
  isLoading: true,
  error: null,
  retryCount: 0
};

// Constantes pour la gestion du cache
const CACHE_KEY = 'subscription_status';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes en millisecondes
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes en millisecondes

/**
 * Hook personnalisé pour gérer l'état et la vérification des abonnements
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  /**
   * Enregistre les statut d'abonnement dans le cache local
   */
  const cacheSubscriptionStatus = useCallback((statusToCache: SubscriptionStatus) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ...statusToCache,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.log('Erreur lors de la mise en cache du statut:', err);
      // Continuer même si le cache échoue
    }
  }, []);

  /**
   * Récupère le statut d'abonnement mis en cache
   * @returns {SubscriptionStatus|null} Statut mis en cache ou null si pas de cache valide
   */
  const getCachedStatus = useCallback((): SubscriptionStatus | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached) as SubscriptionStatus;
      
      // Vérifier l'âge du cache
      if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp) < CACHE_DURATION) {
        return parsedCache;
      }
    } catch (err) {
      console.log('Erreur lors de la récupération du cache:', err);
    }
    
    return null;
  }, []);

  /**
   * Journalise les erreurs liées à l'abonnement
   * @param {string} errorType Type d'erreur
   * @param {any} details Détails de l'erreur
   */
  const logSubscriptionError = useCallback(async (errorType: string, details: any) => {
    console.error(`Erreur d'abonnement: ${errorType}`, details);
    
    try {
      // Enregistrer l'erreur dans votre système d'analyse/log
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      await supabase.functions.invoke('log-subscription-error', {
        body: { errorType, details, userId: userId || 'anonymous' }
      }).catch(err => console.error('Échec de la journalisation de l\'erreur:', err));
    } catch (err) {
      console.error('Erreur lors de la journalisation:', err);
    }
  }, []);

  /**
   * Vérifie si l'utilisateur est en mode développement
   * @returns {boolean} True si en mode développement
   */
  const checkDevMode = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Mode développement détecté, simulation d'un abonnement actif");
      const devStatus = {
        isActive: true,
        type: 'dev_mode',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      setStatus(devStatus);
      cacheSubscriptionStatus(devStatus);
      return true;
    }
    return false;
  }, [cacheSubscriptionStatus]);

  /**
   * Vérifie l'état de la session utilisateur
   * @returns {Promise<Session | null>} La session ou null si non authentifié
   */
  const checkUserSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error.message);
        
        const errorStatus = {
          ...initialStatus,
          isLoading: false,
          error: `Erreur session: ${error.message}`
        };
        
        setStatus(prev => errorStatus);
        logSubscriptionError('session_error', error);
        return null;
      }
      
      if (!session) {
        console.log("Aucune session trouvée dans useSubscription");
        
        const noSessionStatus = {
          ...initialStatus,
          isLoading: false,
          error: 'Non authentifié'
        };
        
        setStatus(noSessionStatus);
        return null;
      }
      
      return session;
    } catch (err) {
      console.error("Exception lors de la vérification de session:", err);
      
      const exceptionStatus = {
        ...initialStatus,
        isLoading: false,
        error: `Exception: ${err.message}`
      };
      
      setStatus(exceptionStatus);
      logSubscriptionError('session_exception', err);
      return null;
    }
  }, [logSubscriptionError]);

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
        
        const errorStatus = {
          ...initialStatus,
          isLoading: false,
          error: errorMessage,
          retryCount: status.retryCount + 1
        };
        
        setStatus(prev => errorStatus);
        logSubscriptionError('check_access_error', { error, message: errorMessage });
        
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
        
        const invalidResponseStatus = {
          ...initialStatus,
          isLoading: false,
          error: "Réponse invalide du serveur",
          retryCount: status.retryCount + 1
        };
        
        setStatus(invalidResponseStatus);
        logSubscriptionError('invalid_response', { data });
        return false;
      }
      
      // Statut d'abonnement valide
      const validStatus = {
        isActive: !!data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      setStatus(validStatus);
      
      // Mettre en cache le statut valide
      cacheSubscriptionStatus(validStatus);
      
      return !!data.access;
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification de l\'abonnement:', err);
      
      const unexpectedErrorStatus = {
        ...initialStatus,
        isLoading: false,
        error: err.message || "Erreur serveur inconnue",
        retryCount: status.retryCount + 1
      };
      
      setStatus(prev => unexpectedErrorStatus);
      logSubscriptionError('unexpected_error', err);
      
      return false;
    }
  }, [status.retryCount, cacheSubscriptionStatus, logSubscriptionError]);

  /**
   * Fonction principale pour vérifier l'abonnement
   */
  const checkSubscription = useCallback(async (force = false) => {
    // Si on ne force pas la vérification, vérifier le cache d'abord
    if (!force) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        console.log("Utilisation du statut d'abonnement mis en cache", cachedStatus);
        setStatus(prev => ({
          ...cachedStatus,
          isLoading: false,
          error: null
        }));
        return;
      }
    }
    
    // Sinon procéder à la vérification
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
      
      const criticalErrorStatus = {
        ...initialStatus,
        isLoading: false,
        error: "Erreur critique: " + (error.message || "inconnue"),
        retryCount: status.retryCount + 1
      };
      
      setStatus(criticalErrorStatus);
      logSubscriptionError('critical_error', error);
    }
  }, [checkDevMode, checkUserSession, checkUserAccess, getCachedStatus, status.retryCount, logSubscriptionError]);

  // Tentative automatique avec retard exponentiel en cas d'erreur
  useEffect(() => {
    if (status.error && status.retryCount < 3) {
      const retryDelay = Math.pow(2, status.retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Nouvel essai dans ${retryDelay/1000}s... (tentative ${status.retryCount + 1}/3)`);
      
      const retryTimer = setTimeout(() => {
        console.log(`Tentative de vérification #${status.retryCount + 1}`);
        checkSubscription(true); // Force la vérification sans utiliser le cache
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [status.error, status.retryCount, checkSubscription]);

  // Vérifier l'abonnement au chargement du composant
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);
  
  // Rafraîchir le statut d'abonnement périodiquement
  useEffect(() => {
    // Rafraîchir le statut toutes les 30 minutes
    const refreshInterval = setInterval(() => {
      console.log('Rafraîchissement périodique du statut d\'abonnement');
      checkSubscription(true); // Force une vérification complète
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
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
