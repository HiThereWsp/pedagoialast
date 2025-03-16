
import { SupabaseClient } from "@supabase/supabase-js";

export async function checkBetaAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking if user is beta user");
  
  // First method: Check in the beta_users table
  const { data: betaUser, error: betaError } = await supabaseClient
    .from('beta_users')
    .select('*')
    .eq('email', user.email)
    .single();
    
  if (betaError && betaError.code !== 'PGRST116') {
    console.error("Beta user check error:", betaError);
  }
    
  if (betaUser) {
    console.log('Utilisateur beta trouvé dans la table beta_users');
    return { 
      access: true, 
      type: 'beta',
      expires_at: null,
    };
  }

  // Second method: Check in user_subscriptions with type=beta
  const { data: betaSubscription, error: betaSubError } = await supabaseClient
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'beta')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (betaSubError) {
    console.error("Beta subscription check error:", betaSubError);
  }

  if (betaSubscription) {
    console.log('Abonnement beta trouvé dans user_subscriptions:', betaSubscription);
    
    // Check if beta subscription is expired
    if (betaSubscription.expires_at) {
      const expiryDate = new Date(betaSubscription.expires_at);
      if (expiryDate < new Date()) {
        console.log("Beta subscription expired at:", expiryDate);
        return { 
          access: false, 
          message: 'Accès beta expiré',
          type: 'beta',
          expires_at: betaSubscription.expires_at
        };
      }
    }
    
    console.log("Active beta subscription found, granting access");
    return { 
      access: true, 
      type: 'beta',
      expires_at: betaSubscription.expires_at,
      promo_code: betaSubscription.promo_code
    };
  }
  
  return null;
}
