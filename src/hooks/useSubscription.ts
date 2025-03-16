
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionStatus = {
  isActive: boolean;
  type: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
};

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    type: null,
    expiresAt: null,
    isLoading: true,
    error: null
  });

  const checkSubscription = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found in useSubscription");
        setStatus({
          isActive: false,
          type: null,
          expiresAt: null,
          isLoading: false,
          error: 'Non authentifié'
        });
        return;
      }
      
      // En mode développement, simuler un abonnement actif pour faciliter les tests
      if (import.meta.env.DEV) {
        console.log("Dev mode detected in useSubscription, simulating active subscription");
        setStatus({
          isActive: true,
          type: 'dev_mode',
          expiresAt: null,
          isLoading: false,
          error: null
        });
        return;
      }
      
      console.log("Invoking check-user-access function");
      const { data, error } = await supabase.functions.invoke('check-user-access');
      
      if (error) {
        console.error('Erreur vérification accès:', error);
        setStatus({
          isActive: false,
          type: null,
          expiresAt: null,
          isLoading: false,
          error: error.message
        });
        return;
      }
      
      console.log("check-user-access response:", data);
      setStatus({
        isActive: data.access,
        type: data.type || null,
        expiresAt: data.expires_at || null,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error('Erreur vérification abonnement:', err);
      setStatus({
        isActive: false,
        type: null,
        expiresAt: null,
        isLoading: false,
        error: err.message
      });
    }
  };

  // Vérifier au chargement du composant
  useEffect(() => {
    checkSubscription();
  }, []);

  // Fonction pour rediriger vers l'abonnement si nécessaire
  const requireSubscription = () => {
    if (status.isLoading) return true; // Attendre le chargement
    
    // Toujours considérer les utilisateurs beta comme ayant un abonnement valide
    if (status.type === 'beta') return true;
    
    // Considérer les utilisateurs en mode développement comme ayant un abonnement valide
    if (status.type === 'dev_mode') return true;
    
    if (!status.isActive) {
      toast.error("Abonnement requis pour accéder à cette fonctionnalité");
      window.location.href = '/pricing';
      return false;
    }
    
    return true;
  };

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
