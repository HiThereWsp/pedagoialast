
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { authenticateUser, createResponse } from "./auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { checkUserAccessByPriority } from "./access-checker.ts";

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

    // Check all access types following priority order
    const accessResult = await checkUserAccessByPriority(
      supabaseClient, 
      user, 
      Deno.env.get('ENVIRONMENT')
    );
    
    return createResponse(accessResult);

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
