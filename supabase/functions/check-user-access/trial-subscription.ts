
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkTrialAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking trial subscription for user:", user.email);
  
  try {
    const { data: trialSubscription, error: trialSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at, promo_code, is_long_trial, trial_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('type', 'trial')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (trialSubError) {
      console.error("Trial subscription check error:", trialSubError);
    }
    
    if (trialSubscription) {
      console.log('Abonnement d\'essai trouvé pour', user.email, ':', trialSubscription);
      
      // Use trial_end for long trials if available
      const expiryDate = trialSubscription.trial_end 
        ? new Date(trialSubscription.trial_end) 
        : (trialSubscription.expires_at ? new Date(trialSubscription.expires_at) : null);
      
      // Check if trial is expired
      if (expiryDate && expiryDate < new Date()) {
        console.log("Trial subscription expired at:", expiryDate, "for", user.email);
        return { 
          access: false, 
          message: 'Période d\'essai expirée',
          type: trialSubscription.type,
          expires_at: trialSubscription.trial_end || trialSubscription.expires_at,
          is_long_trial: trialSubscription.is_long_trial || false
        };
      }
      
      // Determine trial type for display purposes
      const trialType = trialSubscription.is_long_trial ? 'trial_long' : 'trial';
      
      console.log(`Active ${trialSubscription.is_long_trial ? 'long ' : ''}trial subscription found, granting access to`, user.email);
      return { 
        access: true, 
        type: trialType,
        expires_at: trialSubscription.trial_end || trialSubscription.expires_at,
        promo_code: trialSubscription.promo_code,
        is_long_trial: trialSubscription.is_long_trial || false
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkTrialAccess:", err);
    return null;
  }
}
