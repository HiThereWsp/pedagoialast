
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
    const path = url.pathname.replace("/redirect/", "");
    
    if (!path) {
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
      console.error(`Error or redirect not found: ${error?.message || "Not found"}`);
      return new Response(
        JSON.stringify({ error: "Redirect not found" }),
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

    await supabase.rpc("log_redirect_click", {
      p_redirect_id: redirect.id,
      p_user_agent: userAgent,
      p_referer: referer,
      p_ip_address: ip,
    });

    console.log(`Redirecting to: ${redirect.target_url}`);

    // Create the redirect to track.html with the target URL as a parameter
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
