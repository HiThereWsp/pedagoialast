import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Stripe client
// const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_51HrPpqIqXQKnGj4mi4CST5C59N016AKJeIItIS7aFbvVc5EkILfvI4l8OB62QNAW2ZfSSa3v7k6XDwcux4UXm6Wn00dsGWxpA5", {
const stripe = new Stripe("sk_test_51HrPpqIqXQKnGj4mi4CST5C59N016AKJeIItIS7aFbvVc5EkILfvI4l8OB62QNAW2ZfSSa3v7k6XDwcux4UXm6Wn00dsGWxpA5", {
  apiVersion: "2020-08-27",
});

// Initialize Supabase client
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Handle CORS preflight requests
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Log the full request headers for debugging
    console.log("Request headers:", [...req.headers.entries()]);

    // Validate request
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing Stripe signature header");
    }
    console.log(`Stripe-Signature header: ${signature}`);

    // Get the raw body as a string
    const body = await req.text();
    if (!body) {
      throw new Error("Empty request body");
    }
    console.log(`Raw request body: ${body}`);

    // Verify webhook signature
    // const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST");
    // const webhookSecret = "whsec_e3c7485663ec5a2d28600f8743c716504318398b176498741992982785a4d877"
    const webhookSecret = "whsec_otFKDLi2qA6CMhN7oxnekdzCkY27dS3x"
    if (!webhookSecret) {
      throw new Error("Missing webhook secret");
    }
    console.log(`Using webhook secret: ${webhookSecret.substring(0, 8)}... (first 8 chars for logging)`);

    // Verify webhook signature using constructEventAsync
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

    // Process events
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true, event: event.type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      status: 200, // Always return 200 to prevent Stripe retries
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Checkout session completed: ${session.id}`);

  // Check if the session created a subscription
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.log("No subscription associated with this checkout session");
    return;
  }

  // Retrieve the subscription to get its details
  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error(`Error retrieving subscription ${subscriptionId}: ${error.message}`);
    return;
  }

  const customerId = subscription.customer as string;
  const subscriptionStatus = subscription.status;
  const subscriptionType = subscription.metadata?.subscription_type || "monthly";
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Fetch customer email from Stripe
  let customerEmail: string | undefined;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    customerEmail = customer.email;
    console.log(`Fetched customer email: ${customerEmail}`);
  } catch (error) {
    console.error(`Error fetching customer: ${error.message}`);
    return;
  }

  if (!customerEmail) {
    console.error(`No email found for customer ${customerId}`);
    return;
  }

  // Look up user by stripe_customer_id or user_email
  let userId: string | undefined;
  const { data: profileByCustomer, error: customerError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

  if (customerError) {
    console.error(`Error fetching profile by customer ID: ${customerError.message}`);
    return;
  }

  if (profileByCustomer) {
    userId = profileByCustomer.user_id;
    console.log(`Found user ${userId} by stripe_customer_id`);
  } else {
    // Fallback to email lookup
    const { data: profileByEmail, error: emailError } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("user_email", customerEmail)
        .maybeSingle();

    if (emailError) {
      console.error(`Error fetching profile by email: ${emailError.message}`);
      return;
    }

    if (profileByEmail) {
      userId = profileByEmail.user_id;
      console.log(`Found user ${userId} by email`);

      // Update the profile with the stripe_customer_id
      const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", userId);

      if (updateError) {
        console.error(`Error updating profile with stripe_customer_id: ${updateError.message}`);
      }
    }
  }

  if (!userId) {
    console.error(`User not found for customer ${customerId} or email ${customerEmail}`);
    return;
  }

  // Insert new subscription
  const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscriptionStatus as "active" | "canceled" | "past_due",
        type: "paid" as "trial" | "paid",
        plan_variant: subscriptionType,
        current_period_end: currentPeriodEnd,
        created_at: new Date(),
        updated_at: new Date(),
      });

  if (insertError) {
    console.error(`Error inserting subscription: ${insertError.message}`);
    return;
  }

  // Update is_paid_user and role_expiry in user_profiles
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: true,
        role_expiry: currentPeriodEnd,
      })
      .eq("user_id", userId);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  console.log(`Subscription created for user ${userId} from checkout session`);
}

// Handle subscription created event
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const subscriptionStatus = subscription.status;
  const subscriptionType = subscription.metadata?.subscription_type || "monthly";
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Fetch customer email from Stripe
  let customerEmail: string | undefined;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    customerEmail = customer.email;
    console.log(`Fetched customer email: ${customerEmail}`);
  } catch (error) {
    console.error(`Error fetching customer: ${error.message}`);
    return;
  }

  if (!customerEmail) {
    console.error(`No email found for customer ${customerId}`);
    return;
  }

  // Look up user by stripe_customer_id or user_email
  let userId: string | undefined;
  const { data: profileByCustomer, error: customerError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

  if (customerError) {
    console.error(`Error fetching profile by customer ID: ${customerError.message}`);
    return;
  }

  if (profileByCustomer) {
    userId = profileByCustomer.user_id;
    console.log(`Found user ${userId} by stripe_customer_id`);
  } else {
    // Fallback to email lookup
    const { data: profileByEmail, error: emailError } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("user_email", customerEmail)
        .maybeSingle();

    if (emailError) {
      console.error(`Error fetching profile by email: ${emailError.message}`);
      return;
    }

    if (profileByEmail) {
      userId = profileByEmail.user_id;
      console.log(`Found user ${userId} by email`);

      // Update the profile with the stripe_customer_id
      const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", userId);

      if (updateError) {
        console.error(`Error updating profile with stripe_customer_id: ${updateError.message}`);
      }
    }
  }

  if (!userId) {
    console.error(`User not found for customer ${customerId} or email ${customerEmail}`);
    return;
  }

  // Insert new subscription
  const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscriptionStatus as "active" | "canceled" | "past_due",
        type: "paid" as "trial" | "paid",
        plan_variant: subscriptionType,
        current_period_end: currentPeriodEnd,
        created_at: new Date(),
        updated_at: new Date(),
      });

  if (insertError) {
    console.error(`Error inserting subscription: ${insertError.message}`);
    return;
  }

  // Update is_paid_user and role_expiry in user_profiles
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: true,
        role_expiry: currentPeriodEnd,
      })
      .eq("user_id", userId);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  console.log(`Subscription created for user ${userId}`);
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  const subscriptionId = subscription.id;
  const subscriptionStatus = subscription.status;
  const subscriptionType = subscription.metadata?.subscription_type || "monthly";
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Update subscription
  const { data: subscriptionData, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription", subscriptionId)
      .single();

  if (fetchError || !subscriptionData) {
    console.error(`Error fetching subscription for user update: ${fetchError?.message}`);
    return;
  }

  const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: subscriptionStatus as "active" | "canceled" | "past_due",
        plan_variant: subscriptionType,
        current_period: currentPeriodEnd,
        updated_at: new Date(),
      })
      .eq("stripe_subscription", subscriptionId);

  if (updateError) {
    console.error(`Error updating subscription: ${updateError.message}`);
    return;
  }

  // Update is_paid_user and role_expiry based on subscription status
  const isActive = subscriptionStatus === "active";
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: isActive,
        role_expiry: currentPeriodEnd,
      })
      .eq("user_id", subscriptionData.user_id);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  console.log(`Subscription updated: ${subscriptionId}`);
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  const subscriptionId = subscription.id;

  // Update subscription status to canceled
  const { data: subscriptionData, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription", subscriptionId)
      .single();

  if (fetchError || !subscriptionData) {
    console.error(`Error fetching subscription for user update: ${fetchError?.message}`);
    return;
  }

  const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceled" as "active" | "canceled" | "past_due",
        updated_at: new Date(),
      })
      .eq("stripe_subscription", subscriptionId);

  if (updateError) {
    console.error(`Error deleting subscription: ${updateError.message}`);
    return;
  }

  // Update is_paid_user to false and clear role_expiry
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: false,
        role_expiry: null,
      })
      .eq("user_id", subscriptionData.user_id);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  console.log(`Subscription canceled: ${subscriptionId}`);
}