
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkBetaAccess } from "./beta-access.ts";
import { checkPaidAccess } from "./paid-subscription.ts";
import { checkTrialAccess } from "./trial-subscription.ts";
import { authenticateUser, createResponse } from "./auth.ts";

// Explicit CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Function to check development mode
function checkDevelopmentMode(environment) {
  if (environment === 'development') {
    console.log("Development environment detected, granting access");
    return { 
      access: true, 
      type: 'dev_mode',
      expires_at: null,
      message: 'Accès accordé en mode développement'
    };
  }
  
  return null;
}

// Function to check ambassador status
async function checkAmbassadorAccess(supabaseClient, user) {
  console.log("Checking ambassador status for user:", user.email);
  
  try {
    // Special handling for specific ambassadors - Updated to match client-side list
    const specialAmbassadors = [
      'maitreclementtiktok@gmail.com',
      'zoe.lejan@gmail.com',
      'marine.poirel1@gmail.com',
      'mehdijrad@live.fr'
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
