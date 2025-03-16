
import { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

export async function authenticateUser(
  supabaseClient: SupabaseClient,
  authHeader: string | null
) {
  if (!authHeader) {
    console.log("No Authorization header found");
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Non authentifié'
      }
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log("Token extracted from Authorization header");
  
  // Check user
  console.log("Checking user with token");
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    console.error("User error:", userError);
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Utilisateur non trouvé',
        error: userError.message
      }
    };
  }
  
  if (!user) {
    console.log("No user found");
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Utilisateur non trouvé'
      }
    };
  }
  
  console.log("User found:", user.email);
  return { error: false, user };
}

export function createResponse(body: any, status = 200) {
  return new Response(
    JSON.stringify(body),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
}
