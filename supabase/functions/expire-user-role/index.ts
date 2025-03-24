// supabase/functions/check-role-expiry/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface UserProfile {
  id: number;
  user_email: string;
  is_beta: boolean;
  is_ambassador: boolean;
  is_admin: boolean;
  role_expiry: string | null;
}

console.log("Starting check-role-expiry function");

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Allow only POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Supabase client with service role key for full access
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
          JSON.stringify({ error: "Missing Supabase environment variables" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch users with active roles and an expiration date
    const { data: users, error } = await supabase
        .from("user_profiles")
        .select("*")
        .or("is_beta.eq.true,is_ambassador.eq.true,is_admin.eq.true")
        .not("role_expiry", "is", null);

    if (error) {
      const msg = JSON.stringify({ error: "Error fetching users", details: error.message });
      console.error(msg);
      return new Response(msg, {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!users || users.length === 0) {
      const msg = JSON.stringify({ message: "No users with active roles and expiration dates found" });
      console.log(msg);
      return new Response(msg, {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const currentDate = new Date();
    const usersToUpdate: UserProfile[] = [];

    // Check each user for expired roles
    for (const user of users) {
      const expiryDate = user.role_expiry ? new Date(user.role_expiry) : null;

      if (expiryDate && expiryDate < currentDate) {
        // Role has expired, unset all roles
        usersToUpdate.push({
          ...user,
          is_beta: false,
          is_ambassador: false,
          is_admin: false,
          role_expiry: null,
        });
      }
    }

    if (usersToUpdate.length === 0) {
      const msg = JSON.stringify({ message: "No roles have expired" });
      console.log(msg);
      return new Response(msg, {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update the users with expired roles
    const updates = usersToUpdate.map((user) =>
        supabase
            .from("user_profiles")
            .update({
              is_beta: false,
              is_ambassador: false,
              is_admin: false,
              role_expiry: null,
            })
            .eq("id", user.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      const msg = JSON.stringify({
        error: "Error updating users",
        details: errors.map((e) => e.error?.message).join(", "),
      });
      console.error(msg);
      return new Response(msg, {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const msg = JSON.stringify({
      message: `Successfully unset roles for ${usersToUpdate.length} users`,
      updatedUsers: usersToUpdate.map((u) => u.user_email),
    });
    console.log(msg);
    return new Response(msg, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const msg = JSON.stringify({ error: "Internal Server Error", details: error.message });
    console.error(msg);
    return new Response(msg, {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});