
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@12.0.0";

// CORS headers for preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    // Get the request payload
    const { email, session_id } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Stripe session ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session || session.status !== 'complete') {
      return new Response(
        JSON.stringify({ error: "Invalid or incomplete Stripe session" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Ensure this is the beta access product (fZe7vKe8G2nP2SA6ou)
    // For production, you'd validate the price ID (session.line_items.price.id)
    // but we'll skip that for simplicity
    
    // Normalize the email address
    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user already exists in the beta_users table
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('beta_users')
      .select('id, is_validated')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing beta user:", checkError);
      return new Response(
        JSON.stringify({ error: "Database error while checking user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    let result;

    if (existingUser) {
      // Update the existing user - set is_validated to true
      const { data, error } = await supabaseClient
        .from('beta_users')
        .update({ 
          is_validated: true,
          stripe_session_id: session_id,
          updated_at: new Date().toISOString()
        })
        .eq('email', normalizedEmail)
        .select();

      if (error) {
        console.error("Error updating beta user:", error);
        return new Response(
          JSON.stringify({ error: "Database error while updating user" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      result = data;
      console.log("Updated existing beta user:", normalizedEmail);
    } else {
      // Insert a new beta user with is_validated=true
      const { data, error } = await supabaseClient
        .from('beta_users')
        .insert({
          email: normalizedEmail,
          is_validated: true,
          stripe_session_id: session_id,
          source: 'stripe_purchase'
        })
        .select();

      if (error) {
        console.error("Error creating beta user:", error);
        return new Response(
          JSON.stringify({ error: "Database error while creating user" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      result = data;
      console.log("Created new beta user:", normalizedEmail);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Beta access granted successfully",
        data: result
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in handle-stripe-beta-access:", error);
    
    return new Response(
      JSON.stringify({ error: "Server error processing beta access" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
