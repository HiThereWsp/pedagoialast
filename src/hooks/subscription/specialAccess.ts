
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';
import { checkBetaEmailAlternate } from './useBetaCheck';
import { processAmbassadorWelcome } from './ambassador-check';

/**
 * Check special user emails for access with appropriate priority
 * @returns {Promise<SubscriptionStatus | null>} Special status or null
 */
export const checkSpecialEmails = async (): Promise<SubscriptionStatus | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    const userId = data.session?.user?.id;
    
    if (!email) return null;
    
    console.log(`Vérification des accès spéciaux pour: ${email}`);
    
    // Special handling for specific users
    const forcedAmbassadors = [
      'maitreclementtiktok@gmail.com'
    ];
    
    if (email && forcedAmbassadors.includes(email)) {
      console.log(`[DEBUG] Forced ambassador access for: ${email}`);
      return createAmbassadorStatus();
    }
    
    // Check if user has paid or trial subscription first
    // If they do, don't apply beta or ambassador status
    if (userId) {
      const { data: userSub } = await supabase
        .from('user_subscriptions')
        .select('type, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .in('type', ['paid', 'trial'])
        .maybeSingle();
        
      if (userSub) {
        console.log(`User has active ${userSub.type} subscription, skipping special access checks`);
        return null;
      }
    }
    
    // Check for ambassador status first (higher priority than beta)
    if (userId) {
      const isAmbassador = await checkAmbassadorSubscription(userId, email);
      if (isAmbassador) {
        console.log("Ambassador status detected, providing ambassador access:", email);
        
        // Ensure ambassador is added to Brevo list and welcome email is sent
        await processAmbassadorWelcome(userId, email);
        
        return createAmbassadorStatus();
      }
    }
    
    // Then check for beta status through user_subscriptions
    if (userId) {
      const { data: betaSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'beta')
        .eq('status', 'active')
        .maybeSingle();
        
      if (betaSubscription) {
        console.log("Beta subscription detected, providing beta access:", email);
        return createBetaStatus();
      }
    }
    
    // Fallback: legacy check for emails in beta_users (backward compatibility)
    const isBetaUser = await checkBetaEmailAlternate(email);
    if (isBetaUser) {
      console.log("Validated beta user detected via alternative method, providing beta access:", email);
      return createBetaStatus();
    }
  } catch (err) {
    console.error("Error checking special emails:", err);
  }
  
  return null;
};

/**
 * Check if a user has ambassador status in user_subscriptions
 */
export const checkAmbassadorSubscription = async (userId: string, email: string): Promise<boolean> => {
  try {
    console.log(`Checking ambassador subscription for user: ${userId}, email: ${email}`);
    
    // Special handling for known ambassadors
    const specialAmbassadors = [
      'maitreclementtiktok@gmail.com'
    ];
    
    if (specialAmbassadors.includes(email)) {
      console.log(`Special ambassador detected: ${email}`);
      return true;
    }
    
    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('type')
      .eq('user_id', userId)
      .eq('type', 'ambassador')
      .eq('status', 'active')
      .maybeSingle();
    
    return !!userSub;
  } catch (err) {
    console.error("Error checking ambassador subscription:", err);
    return false;
  }
};

/**
 * Create a beta status object
 */
function createBetaStatus(): SubscriptionStatus {
  return {
    isActive: true,
    type: 'beta',
    expiresAt: null,
    isLoading: false,
    error: null,
    retryCount: 0
  };
}

/**
 * Create an ambassador status object
 */
function createAmbassadorStatus(): SubscriptionStatus {
  return {
    isActive: true,
    type: 'ambassador',
    expiresAt: null,
    isLoading: false,
    error: null,
    retryCount: 0,
    special_handling: true
  };
}
