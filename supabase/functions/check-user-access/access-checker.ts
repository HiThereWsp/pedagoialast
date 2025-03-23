import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkBetaAccess } from "./beta-access.ts";
import { checkPaidAccess } from "./paid-subscription.ts";
import { checkTrialAccess } from "./trial-subscription.ts";
import { checkAmbassadorAccess } from "./ambassador-access.ts";
import { checkDevelopmentMode } from "./development.ts";

/**
 * Main access checker that follows priority order for subscription types
 */
export async function checkUserAccessByPriority(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string },
  environment: string | undefined
) {
  // Check for development mode
  const devModeResult = checkDevelopmentMode(environment);
  if (devModeResult) {
    console.log("Development mode detected, granting access");
    return devModeResult;
  }

  // Check access in priority order:
  // 1. Paid (HIGHEST PRIORITY)
  console.log("Checking paid access for", user.email);
  const paidResult = await checkPaidAccess(supabaseClient, user);
  if (paidResult) {
    console.log("Paid access result for", user.email, ":", paidResult);
    return paidResult;
  }
  
  // 2. Trial (SECOND PRIORITY)
  console.log("Checking trial access for", user.email);
  const trialResult = await checkTrialAccess(supabaseClient, user);
  if (trialResult) {
    console.log("Trial access result for", user.email, ":", trialResult);
    return trialResult;
  }
  
  // 3. Ambassador (THIRD PRIORITY)
  console.log("Checking ambassador access for", user.email);
  const ambassadorResult = await checkAmbassadorAccess(supabaseClient, user);
  if (ambassadorResult) {
    console.log("Ambassador access result for", user.email, ":", ambassadorResult);
    return ambassadorResult;
  }
  
  // 4. Beta (FOURTH PRIORITY)
  console.log("Checking beta access for", user.email);
  const betaResult = await checkBetaAccess(supabaseClient, user);
  if (betaResult) {
    console.log("Beta access result for", user.email, ":", betaResult);
    return betaResult;
  }

  // No subscription found
  console.log('No active subscription found for', user.email);
  return { 
    access: false, 
    message: 'No active subscription' 
  };
}
