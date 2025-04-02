
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request data
    const requestData = await req.json();
    const { reportId } = requestData;

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: "Report ID is required" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // Fetch the bug report details
    const { data: bugReport, error: fetchError } = await supabaseClient
      .from("bug_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch bug report details", details: fetchError }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // Get admin emails to notify
    const { data: adminProfiles, error: adminError } = await supabaseClient
      .from("user_profiles")
      .select("user_email")
      .eq("is_admin", true);

    if (adminError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch admin profiles", details: adminError }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }

    // For now, just return success (email sending would be implemented here)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Bug report notification processed", 
        bugReport,
        adminEmails: adminProfiles.map(profile => profile.user_email)
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );
  }
});
