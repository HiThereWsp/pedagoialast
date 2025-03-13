
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SubscriptionType = 'beta' | 'trial' | 'paid';
export type SubscriptionStatus = 'active' | 'expired';

export interface UserSubscription {
  id: string;
  userId: string;
  type: SubscriptionType;
  expiresAt: string;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  daysLeft?: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération de l'abonnement :", error);
        setError(error.message);
        setSubscription(null);
      } else if (data) {
        // Calculer le nombre de jours restants
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setSubscription({
          id: data.id,
          userId: data.user_id,
          type: data.type,
          expiresAt: data.expires_at,
          status: data.status,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          daysLeft: daysLeft > 0 ? daysLeft : 0
        });
        setError(null);
      }
    } catch (err) {
      console.error("Erreur inattendue :", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    // Mettre en place un écouteur pour les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [user]);

  // Vérifier si l'abonnement est actif
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    
    // Si le statut est 'expired', l'abonnement n'est pas actif
    if (subscription.status === 'expired') return false;
    
    // Vérifier si la date d'expiration est dans le futur
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    return expiresAt > now;
  };

  // Obtenir le type d'abonnement avec état actif/expiré
  const getSubscriptionType = (): string => {
    if (!subscription) return "non abonné";
    
    const isActive = isSubscriptionActive();
    if (!isActive) return "expiré";
    
    switch (subscription.type) {
      case 'beta':
        return "bêta";
      case 'trial':
        return "essai";
      case 'paid':
        return "premium";
      default:
        return "inconnu";
    }
  };

  return {
    subscription,
    loading,
    error,
    isSubscriptionActive,
    getSubscriptionType,
    refreshSubscription: fetchSubscription,
  };
};
