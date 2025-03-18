
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkTrialAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking trial subscription for user:", user.email);
  
  try {
    const { data: trialSubscription, error: trialSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at, promo_code')
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
      
      // Check if trial is expired
      if (trialSubscription.expires_at) {
        const expiryDate = new Date(trialSubscription.expires_at);
        if (expiryDate < new Date()) {
          console.log("Trial subscription expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Période d\'essai expirée',
            type: trialSubscription.type,
            expires_at: trialSubscription.expires_at
          };
        }
      }
      
      console.log("Active trial subscription found, granting access to", user.email);
      return { 
        access: true, 
        type: trialSubscription.type,
        expires_at: trialSubscription.expires_at,
        promo_code: trialSubscription.promo_code
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkTrialAccess:", err);
    return null;
  }
}
