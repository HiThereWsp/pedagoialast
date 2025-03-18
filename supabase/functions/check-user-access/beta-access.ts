
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkBetaAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking if user is beta user:", user.email);
  
  // Check in the beta_users table with is_validated=true
  const { data: betaUser, error: betaError } = await supabaseClient
    .from('beta_users')
    .select('*')
    .eq('email', user.email.toLowerCase())
    .eq('is_validated', true)
    .single();
    
  if (betaError && betaError.code !== 'PGRST116') {
    console.error("Beta user check error:", betaError);
  }
    
  if (betaUser) {
    console.log('Validated beta user found in beta_users table:', user.email);
    return { 
      access: true, 
      type: 'beta',
      expires_at: null,
    };
  }

  // For backward compatibility, check in user_subscriptions table
  console.log("Checking beta subscription in user_subscriptions for", user.email);
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
    return { 
      access: false, 
      message: `Erreur lors de la vérification de l'abonnement beta: ${betaSubError.message}`,
      type: 'error'
    };
  }

  if (betaSubscription) {
    console.log('Beta subscription found in user_subscriptions for', user.email, ':', betaSubscription);
    
    // Check if beta subscription is expired
    if (betaSubscription.expires_at) {
      const expiryDate = new Date(betaSubscription.expires_at);
      if (expiryDate < new Date()) {
        console.log("Beta subscription expired at:", expiryDate, "for", user.email);
        return { 
          access: false, 
          message: 'Accès beta expiré',
          type: 'beta',
          expires_at: betaSubscription.expires_at
        };
      }
    }
    
    console.log("Active beta subscription found, granting access to", user.email);
    return { 
      access: true, 
      type: 'beta',
      expires_at: betaSubscription.expires_at,
      promo_code: betaSubscription.promo_code,
      beta_user: true
    };
  }
  
  console.log("No beta access found for", user.email);
  return null;
}
