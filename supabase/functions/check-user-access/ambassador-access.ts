
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Checks if a user has ambassador access
 */
export async function checkAmbassadorAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking ambassador status for user:", user.email);
  
  try {
    // Special handling for specific ambassadors - Updated to match client-side list
    const specialAmbassadors = [
      'maitreclementtiktok@gmail.com',
      'zoe.lejan@gmail.com',
      'marine.poirel1@gmail.com',
      'mehdijrad@live.fr',
      'ag.tradeunion@gmail.com'
    ];
    
    if (user.email && specialAmbassadors.includes(user.email)) {
      console.log(`[Manual override] Special ambassador status for ${user.email}`);
      return { 
        access: true, 
        type: 'ambassador',
        expires_at: null
      };
    }
    
    // Check in ambassador_program table
    const { data: ambassador, error: ambassadorError } = await supabaseClient
      .from('ambassador_program')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
      
    if (ambassadorError) {
      console.error("Ambassador check error:", ambassadorError);
    }
    
    if (ambassador) {
      console.log('Ambassador found for', user.email, ':', ambassador);
      
      // Check if ambassador access is expired
      if (ambassador.expires_at) {
        const expiryDate = new Date(ambassador.expires_at);
        if (expiryDate < new Date()) {
          console.log("Ambassador access expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Accès ambassadeur expiré',
            type: 'ambassador',
            expires_at: ambassador.expires_at
          };
        }
      }
      
      console.log("Active ambassador status found, granting access to", user.email);
      return { 
        access: true, 
        type: 'ambassador',
        expires_at: ambassador.expires_at
      };
    }
    
    // Also check in user_subscriptions for type=ambassador
    const { data: ambassadorSub, error: ambassadorSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'ambassador')
      .eq('status', 'active')
      .maybeSingle();
      
    if (ambassadorSubError) {
      console.error("Ambassador subscription check error:", ambassadorSubError);
    }
    
    if (ambassadorSub) {
      console.log('Ambassador subscription found for', user.email, ':', ambassadorSub);
      
      // Check if ambassador subscription is expired
      if (ambassadorSub.expires_at) {
        const expiryDate = new Date(ambassadorSub.expires_at);
        if (expiryDate < new Date()) {
          console.log("Ambassador subscription expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Abonnement ambassadeur expiré',
            type: 'ambassador',
            expires_at: ambassadorSub.expires_at
          };
        }
      }
      
      console.log("Active ambassador subscription found, granting access to", user.email);
      return { 
        access: true, 
        type: 'ambassador',
        expires_at: ambassadorSub.expires_at
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkAmbassadorAccess:", err);
    return null;
  }
}
