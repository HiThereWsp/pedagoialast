
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Redirect Edge Function initialized");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the path from the URL
    const url = new URL(req.url);
    let path = url.pathname.replace("/redirect/", "");
    
    console.log(`Original redirect path received: ${path}`);
    
    // Special handling for creator URLs
    if (path.includes("/maitreClement") || 
        path.includes("/lollieUnicorn") || 
        path.includes("/laprof40") || 
        path.includes("/mehdush") || 
        path.includes("/sylvie")) {
      
      const parts = path.split("/");
      const creator = parts[parts.length - 1];
      // For creator paths, search just the creator name
      path = `t20/${creator}`;
      console.log(`Creator detected, looking up: ${path}`);
    }
    
    if (!path) {
      console.error("No redirect path provided");
      return new Response(
        JSON.stringify({ error: "No redirect path provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing redirect for path: ${path}`);

    // Get the redirect information from the database
    const { data: redirect, error } = await supabase
      .rpc("get_url_redirect_by_path", { p_short_path: path });

    if (error || !redirect) {
      console.error(`Error or redirect not found: ${error?.message || "Not found"}, Path: ${path}`);
      return new Response(
        JSON.stringify({ error: "Redirect not found", path: path }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the redirect click
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    
    // Get client IP from Cloudflare headers or fallback
    const ip = req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-forwarded-for") || 
               "unknown";

    // Log the click to Supabase
    const { error: logError } = await supabase.rpc("log_redirect_click", {
      p_redirect_id: redirect.id,
      p_user_agent: userAgent,
      p_referer: referer,
      p_ip_address: ip,
    });

    if (logError) {
      console.error(`Error logging redirect click: ${logError.message}`);
      // Continue anyway to ensure user is redirected
    } else {
      console.log(`Successfully logged click for redirect ID: ${redirect.id}`);
    }

    console.log(`Redirecting to: ${redirect.target_url}`);

    // Create the redirect to tracking page with the target URL as a parameter
    const trackingPage = `/r-track.html?id=${encodeURIComponent(redirect.id)}&dest=${encodeURIComponent(redirect.target_url)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": trackingPage
      }
    });
  } catch (err) {
    console.error(`Error processing redirect: ${err.message}`);
    return new Response(
      JSON.stringify({ error: "Failed to process redirect" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
