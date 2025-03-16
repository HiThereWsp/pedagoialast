
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    type: null,
    expiresAt: null,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkSubscription = useCallback(async (forceCheck = false) => {
    // Vérifier si les données en cache sont encore valides
    if (
      !forceCheck && 
      status.lastChecked && 
      Date.now() - status.lastChecked < CACHE_DURATION
    ) {
      console.log("Utilisation du cache pour le statut d'abonnement");
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log("Vérification de la session utilisateur");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Aucune session trouvée dans useSubscription");
        setStatus({
          isActive: false,
          type: null,
          expiresAt: null,
          isLoading: false,
          error: 'Non authentifié',
          lastChecked: Date.now()
        });
        return;
      }
      
      // En mode développement, simuler un abonnement actif pour faciliter les tests
      if (import.meta.env.DEV) {
        console.log("Mode développement détecté, simulation d'un abonnement actif");
        setStatus({
          isActive: true,
          type: 'dev_mode',
          expiresAt: null,
          isLoading: false,
          error: null,
          lastChecked: Date.now()
        });
        return;
      }
      
      console.log("Appel de la fonction check-user-access");
      
      // Ajouter un timeout pour éviter les attentes infinies
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Délai d'attente dépassé")), 10000);
      });
      
      const fetchPromise = supabase.functions.invoke('check-user-access');
      
      // Utiliser Promise.race pour limiter le temps d'attente
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as {data: any, error: any};
      
      if (error) {
        console.error('Erreur vérification accès:', error);
        setStatus({
          isActive: false,
          type: null,
          expiresAt: null,
          isLoading: false,
          error: error.message,
          lastChecked: Date.now()
        });
        return;
      }
      
      console.log("Réponse check-user-access:", data);
      setStatus({
        isActive: data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null,
        lastChecked: Date.now()
      });
    } catch (err: any) {
      console.error('Erreur vérification abonnement:', err);
      setStatus({
        isActive: false,
        type: null,
        expiresAt: null,
        isLoading: false,
        error: err.message,
        lastChecked: Date.now() // Mettre à jour lastChecked même en cas d'erreur
      });
    }
  }, [status.lastChecked]);

  // Vérifier au chargement du composant
  useEffect(() => {
    checkSubscription();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log(`Événement d'authentification détecté: ${event}, actualisation du statut d'abonnement`);
        checkSubscription(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Fonction pour rediriger vers l'abonnement si nécessaire
  const requireSubscription = useCallback(() => {
    if (status.isLoading) return true; // Attendre le chargement
    
    if (!status.isActive) {
      toast.error("Abonnement requis pour accéder à cette fonctionnalité");
      window.location.href = '/pricing';
      return false;
    }
    
    return true;
  }, [status.isLoading, status.isActive]);

  return {
    isSubscribed: status.isActive,
    subscriptionType: status.type,
    expiresAt: status.expiresAt,
    isLoading: status.isLoading,
    error: status.error,
    checkSubscription: () => checkSubscription(true),
    requireSubscription
  };
};
