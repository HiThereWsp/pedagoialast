
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";



interface CheckoutRequestBody {
  priceId: string;
  subscriptionType: string;
  productId: string;
  testMode: boolean;
  // UTM parameters for tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // Additional tracking parameters
  referrer?: string;
  landing_page?: string;
}

// Generate a client ID for cross-domain tracking
function generateClientId(): string {
  return `pedagoia_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Main handler for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Validate the request method
  if (req.method !== "POST") {
    return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        }
    );
  }

  // Validate the origin header
  const origin = req.headers.get("origin");

  try {
    // Parse and validate the request body
    const body: CheckoutRequestBody = await req.json();
    const { priceId, subscriptionType, productId, testMode } = body;

    console.log("Received request data:", { priceId, subscriptionType, productId, testMode });

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    if (!subscriptionType) {
      throw new Error("Subscription type is required");
    }

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Load Stripe secret key based on testMode
    // const stripeSecretKey = "sk_test_51HrPpqIqXQKnGj4mi4CST5C59N016AKJeIItIS7aFbvVc5EkILfvI4l8OB62QNAW2ZfSSa3v7k6XDwcux4UXm6Wn00dsGWxpA5"
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")

    if (!stripeSecretKey) {
      console.error("Stripe secret key not found in environment variables");
      throw new Error("Stripe configuration is missing");
    }

    console.log(`Using Stripe key in ${testMode ? "TEST" : "PRODUCTION"} mode`);
    console.log(`Stripe key starts with: ${stripeSecretKey.substring(0, 7)}...`);

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2020-08-27",
    });

    // Get user information from the Authorization header (optional)
    let userId: string | null = null;
    let userEmail: string | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase configuration is missing");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
          throw new Error(`Authentication error: ${error.message}`);
        }

        if (user) {
          userId = user.id;
          userEmail = user.email;
          console.log(`Authenticated user: ${userEmail} (ID: ${userId})`);
        }
      } catch (error) {
        console.error("Authentication failed:", error.message);
        // Continue without user info; authentication is optional
      }
    } else {
      console.log("No Authorization header provided; proceeding without user authentication");
    }

    // Generate a unique client ID for cross-domain tracking
    const clientId = generateClientId();

    // Extract UTM parameters and other tracking data
    const utmParams = {
      utm_source: body.utm_source || "",
      utm_medium: body.utm_medium || "",
      utm_campaign: body.utm_campaign || "",
      utm_content: body.utm_content || "",
      utm_term: body.utm_term || "",
      referrer: body.referrer || "",
      landing_page: body.landing_page || "",
    };
// Create the Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: "subscription",
  success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=${subscriptionType}&client_id=${clientId}`,
  cancel_url: `${origin}/pricing?canceled=true&type=${subscriptionType}&client_id=${clientId}`,
  client_reference_id: clientId,
  allow_promotion_codes: true,  // Add this line from Second-branch
  metadata: {
    subscription_type: subscriptionType,
    product_id: productId,
    user_id: userId || "anonymous",
    test_mode: testMode ? "true" : "false",
    // Add UTM parameters to metadata
    ...utmParams,
  },
  // ...

      subscription_data: {
        trial_period_days: 3
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Checkout Session URL");
    }

    console.log(`Checkout Session created successfully. URL: ${session.url.substring(0, 50)}...`);

    return new Response(
        JSON.stringify({ 
          url: session.url,
          client_id: clientId, // Return the client ID for frontend tracking
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
    );
  } catch (error) {
    console.error("Error creating Checkout Session:", error.message);
    return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
    );
  }
});
