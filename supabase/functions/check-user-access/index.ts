
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkBetaAccess } from "./beta-access.ts";
import { checkPaidAccess } from "./paid-subscription.ts";
import { checkTrialAccess } from "./trial-subscription.ts";
import { checkAmbassadorAccess } from "./ambassador-access.ts";
import { checkDevelopmentMode } from "./development.ts";
import { authenticateUser, createResponse } from "./auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Main entry point for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Starting check-user-access function");
    
    // Get authentication token
    const authHeader = req.headers.get('Authorization');
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    console.log("Supabase client initialized");

    // Authenticate user
    const authResult = await authenticateUser(supabaseClient, authHeader);
    if (authResult.error) {
      console.log("Authentication error:", authResult.body);
      return createResponse(authResult.body, authResult.status);
    }
    
    const user = authResult.user;
    console.log("Authenticated user:", user.email);

    // Check for development mode
    const devModeResult = checkDevelopmentMode(Deno.env.get('ENVIRONMENT'));
    if (devModeResult) {
      console.log("Development mode detected, granting access");
      return createResponse(devModeResult);
    }

    // Check access in priority order:
    // 1. Paid (HIGHEST PRIORITY)
    console.log("Checking paid access for", user.email);
    const paidResult = await checkPaidAccess(supabaseClient, user);
    if (paidResult) {
      console.log("Paid access result for", user.email, ":", paidResult);
      return createResponse(paidResult);
    }
    
    // 2. Trial (SECOND PRIORITY)
    console.log("Checking trial access for", user.email);
    const trialResult = await checkTrialAccess(supabaseClient, user);
    if (trialResult) {
      console.log("Trial access result for", user.email, ":", trialResult);
      return createResponse(trialResult);
    }
    
    // 3. Ambassador (THIRD PRIORITY)
    console.log("Checking ambassador access for", user.email);
    const ambassadorResult = await checkAmbassadorAccess(supabaseClient, user);
    if (ambassadorResult) {
      console.log("Ambassador access result for", user.email, ":", ambassadorResult);
      return createResponse(ambassadorResult);
    }
    
    // 4. Beta (FOURTH PRIORITY)
    console.log("Checking beta access for", user.email);
    const betaResult = await checkBetaAccess(supabaseClient, user);
    if (betaResult) {
      console.log("Beta access result for", user.email, ":", betaResult);
      return createResponse(betaResult);
    }

    // No subscription found
    console.log('No active subscription found for', user.email);
    return createResponse({ 
      access: false, 
      message: 'No active subscription' 
    });

  } catch (error) {
    console.error('General error:', error);
    return createResponse({ 
      error: error.message,
      stack: error.stack,
      access: false,
      message: 'Server error while checking access'
    }, 500);
  }
});
