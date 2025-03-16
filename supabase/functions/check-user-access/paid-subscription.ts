
import { SupabaseClient } from "@supabase/supabase-js";

export async function checkPaidAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking paid subscription for user");
  
  const { data: paidSubscription, error: paidSubError } = await supabaseClient
    .from('user_subscriptions')
    .select('status, type, expires_at, promo_code')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('type', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (paidSubError) {
    console.error("Paid subscription check error:", paidSubError);
  }
  
  if (paidSubscription) {
    console.log('Abonnement payant trouvé:', paidSubscription);
    
    // Check if subscription is expired
    if (paidSubscription.expires_at) {
      const expiryDate = new Date(paidSubscription.expires_at);
      if (expiryDate < new Date()) {
        console.log("Paid subscription expired at:", expiryDate);
        return { 
          access: false, 
          message: 'Abonnement expiré',
          type: paidSubscription.type,
          expires_at: paidSubscription.expires_at
        };
      }
    }
    
    console.log("Active paid subscription found, granting access");
    return { 
      access: true, 
      type: paidSubscription.type,
      expires_at: paidSubscription.expires_at,
      promo_code: paidSubscription.promo_code
    };
  }
  
  return null;
}
