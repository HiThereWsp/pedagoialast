
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkBetaAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking if user is beta user:", user.email);
  
  // Check in user_subscriptions table for type=beta
  console.log("Checking beta subscription for", user.email);
  const { data: betaSubscription, error: betaError } = await supabaseClient
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'beta')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (betaError) {
    console.error("Beta subscription check error:", betaError);
    return { 
      access: false, 
      message: `Erreur lors de la vérification de l'abonnement beta: ${betaError.message}`,
      type: 'error'
    };
  }

  if (betaSubscription) {
    console.log('Beta subscription found for', user.email, ':', betaSubscription);
    
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
  
  // Special bypass for specific test email
  if (user.email === 'moienseignant3.0@gmail.com') {
    console.log("Special test email detected, granting beta access");
    return {
      access: true,
      type: 'beta',
      expires_at: null,
      beta_user: true,
      special_handling: true
    };
  }
  
  console.log("No beta access found for", user.email);
  return null;
}
