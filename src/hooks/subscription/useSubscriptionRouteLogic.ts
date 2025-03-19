
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';
import { toast } from '@/hooks/use-toast';
import { fixAmbassadorSubscription } from '@/utils/ambassadorUtils';

/**
 * Custom hook for managing subscription route logic
 */
export const useSubscriptionRouteLogic = () => {
  const { isSubscribed, isLoading, error, checkSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [showRepairOption, setShowRepairOption] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if the user has special handling capability
  useEffect(() => {
    const checkUserEmail = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        
        // Check if this user might need repair option
        const userEmail = data.session.user.email?.toLowerCase();
        // Look for stripe customer or other indicators of payment
        if (userEmail && error) {
          try {
            // Check if we find evidence of active subscription in Stripe
            const { data: eventData } = await supabase
              .from('user_events')
              .select('*')
              .eq('user_id', data.session.user.id)
              .eq('event_type', 'subscription_updated')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            setShowRepairOption(!!eventData);
          } catch (e) {
            console.error("Error checking repair eligibility:", e);
          }
        }
      }
    };
    
    checkUserEmail();
  }, [error]);

  // Flag to determine if we should show content now
  const showContent = Boolean(
    // In development mode, always show content
    import.meta.env.DEV ||
    // User is subscribed
    isSubscribed
  );

  // Function to manually retry verification
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    toast({
      title: "Vérification en cours",
      description: "Nous vérifions votre abonnement...",
      duration: 3000,
    });
    
    try {
      await checkSubscription(true); // Force check
      toast({
        title: "Vérification terminée",
        description: "Statut d'abonnement mis à jour",
        duration: 3000,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Échec de la vérification",
        description: "Impossible de vérifier votre abonnement",
        duration: 5000,
      });
      console.error("Verification error:", e);
    } finally {
      setIsRetrying(false);
    }
  }, [checkSubscription]);
  
  // Function to repair ambassador subscription
  const handleRepair = useCallback(async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Email de l'utilisateur non disponible",
        duration: 5000,
      });
      return;
    }
    
    setIsRepairing(true);
    
    try {
      const result = await fixAmbassadorSubscription(user.email);
      
      if (result.success) {
        toast({
          title: "Réparation réussie",
          description: result.message,
          duration: 5000,
        });
        
        // Force a verification after repair
        await handleRetry();
      } else {
        toast({
          variant: "destructive",
          title: "Échec de la réparation",
          description: result.message,
          duration: 5000,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la réparation",
        duration: 5000,
      });
      console.error("Repair error:", e);
    } finally {
      setIsRepairing(false);
    }
  }, [user, handleRetry]);

  // Function to check if repair is eligible
  const checkRepairEligibility = useCallback(async () => {
    return showRepairOption;
  }, [showRepairOption]);

  return {
    isSubscribed,
    isLoading,
    isChecking,
    error,
    showContent,
    isRetrying,
    isRepairing,
    handleRetry,
    handleRepair,
    checkRepairEligibility,
    user
  };
};
