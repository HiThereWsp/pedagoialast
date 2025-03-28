import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
// Define CORS headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "https://pedagoia.fr",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
// };

// Interface for the request body
interface GetSessionRequestBody {
  sessionId: string;
}

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
  // const origin = req.headers.get("origin");
  // if (origin !== "https://pedagoia.fr") {
  //   return new Response(
  //       JSON.stringify({ error: "Unauthorized origin" }),
  //       {
  //         headers: { ...corsHeaders, "Content-Type": "application/json" },
  //         status: 403,
  //       }
  //   );
  // }

  try {
    // --- test key
    // const stripeSecretKey = "sk_test_51HrPpqIqXQKnGj4mi4CST5C59N016AKJeIItIS7aFbvVc5EkILfvI4l8OB62QNAW2ZfSSa3v7k6XDwcux4UXm6Wn00dsGWxpA5"
    // -------
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")
    // Parse and validate the request body
    const body: GetSessionRequestBody = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      throw new Error("Session ID is required");
    }


    if (!stripeSecretKey) {
      console.error("Stripe secret key not found in environment variables");
      throw new Error("Stripe configuration is missing");
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2020-08-27",
    });

    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      throw new Error("No subscription associated with this session");
    }

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Retrieve the customer
    const customer = await stripe.customers.retrieve(session.customer as string);

    // Retrieve the price to get the product name and amount
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    const product = await stripe.products.retrieve(price.product as string);

    // Prepare the response data
    const responseData = {
      subscriptionType: session.metadata?.subscription_type || "unknown",
      planName: product.name,
      amount: price.unit_amount ? price.unit_amount / 100 : 0, // Convert cents to euros
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      customerEmail: customer.email || session.customer_email || "unknown",
    };

    return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
    );
  } catch (error) {
    console.error("Error retrieving Checkout Session:", error.message);
    return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
    );
  }
});