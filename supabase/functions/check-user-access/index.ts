
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders } from "../_shared/cors.ts"
import { authenticateUser, createResponse } from "./auth.ts"
import { checkBetaAccess } from "./beta-subscription.ts"
import { checkPaidAccess } from "./paid-subscription.ts"
import { checkTrialAccess } from "./trial-subscription.ts"
import { checkDevelopmentMode } from "./development.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
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

    // Check subscription access in priority order: Beta -> Paid -> Trial
    
    // 1. Check for beta access (HIGHEST PRIORITY)
    console.log("Checking beta access for", user.email);
    const betaResult = await checkBetaAccess(supabaseClient, user);
    if (betaResult) {
      console.log("Beta access result for", user.email, ":", betaResult);
      return createResponse(betaResult);
    }

    // 2. Check for paid subscription (SECOND PRIORITY)
    console.log("Checking paid access for", user.email);
    const paidResult = await checkPaidAccess(supabaseClient, user);
    if (paidResult) {
      console.log("Paid access result for", user.email, ":", paidResult);
      return createResponse(paidResult);
    }

    // 3. Check for trial subscription (LOWEST PRIORITY)
    console.log("Checking trial access for", user.email);
    const trialResult = await checkTrialAccess(supabaseClient, user);
    if (trialResult) {
      console.log("Trial access result for", user.email, ":", trialResult);
      return createResponse(trialResult);
    }

    // No subscription found
    console.log('Aucun abonnement actif trouvé pour', user.email);
    return createResponse({ 
      access: false, 
      message: 'Aucun abonnement actif' 
    });

  } catch (error) {
    console.error('Erreur générale:', error);
    return createResponse({ 
      error: error.message,
      stack: error.stack,
      access: false,
      message: 'Erreur serveur lors de la vérification de l\'accès'
    }, 500);
  }
});
