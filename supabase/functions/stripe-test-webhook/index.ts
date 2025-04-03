import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendSubscriptionEmail } from './email_client.ts';
import { manageContactList } from './brevo_list_client.ts';

// CORS headers for responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Stripe client

const stripeSecretKey = "sk_test_51HrPpqIqXQKnGj4mi4CST5C59N016AKJeIItIS7aFbvVc5EkILfvI4l8OB62QNAW2ZfSSa3v7k6XDwcux4UXm6Wn00dsGWxpA5"
// const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
const stripe = new Stripe(stripeSecretKey, {
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
    // const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")
    const webhookSecret = "whsec_otFKDLi2qA6CMhN7oxnekdzCkY27dS3x" // Test secret
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

  // Check if the subscription already exists to avoid duplicates
  const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

  if (existingSubscription) {
    console.log(`Subscription ${subscriptionId} already exists, skipping creation`);
    return;
  }

  // Insert new subscription
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscriptionStatus,
    type: subscription.status === "trialing" ? "trial" : "paid",
    plan_variant: subscriptionType,
    current_period_end: currentPeriodEnd,
    expires_at: currentPeriodEnd, // Set expires_at to current_period_end
    created_at: new Date(),
    updated_at: new Date(),
  };

  console.log("Attempting to insert subscription with data:", subscriptionData);

  const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert(subscriptionData);

  if (insertError) {
    console.error(`Error inserting subscription: ${insertError.message}`);
    console.error("Full error details:", JSON.stringify(insertError, null, 2));
    return;
  }

  // Update is_paid_user and role_expiry in user_profiles
  const isActiveOrTrialing = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: isActiveOrTrialing,
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
  console.log({subscriptionStatus})
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

  // Check if the subscription already exists to avoid duplicates
  const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

  if (existingSubscription) {
    console.log(`Subscription ${subscriptionId} already exists, skipping creation`);
    return;
  }

  // Insert new subscription
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscriptionStatus,
    type: subscription.status === "trialing" ? "trial" : "paid",
    plan_variant: subscriptionType,
    current_period_end: currentPeriodEnd,
    expires_at: currentPeriodEnd, // Set expires_at to current_period_end
    created_at: new Date(),
    updated_at: new Date(),
  };

  console.log("Attempting to insert subscription with data:", subscriptionData);

  const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert(subscriptionData);

  if (insertError) {
    console.error(`Error inserting subscription: ${insertError.message}`);
    console.error("Full error details:", JSON.stringify(insertError, null, 2));
    return;
  }

  // Update is_paid_user and role_expiry in user_profiles
  const isActiveOrTrialing = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: isActiveOrTrialing,
        role_expiry: currentPeriodEnd,
      })
      .eq("user_id", userId);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  // Fetch first_name from profiles table
  const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .maybeSingle();

  const userName = profileError || !profile?.first_name || profile.first_name === "Anonymous" ? "Customer" : profile.first_name;

  await Promise.all([
    sendSubscriptionEmail(customerEmail, subscriptionStatus, userName),
    manageContactList(customerEmail, subscriptionStatus)
  ]);

  console.log(`Subscription created for user ${userId}`);
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  const subscriptionId = subscription.id;
  const subscriptionStatus = subscription.status;
  const subscriptionType = subscription.metadata?.subscription_type || "monthly";
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  console.log({subscriptionStatus});
  // Fetch the subscription record from user_subscriptions
  console.log(`Fetching user subscription for stripe_subscription_id: ${subscriptionId}`);
  let { data: subscriptionData, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

  if (fetchError) {
    console.error(`Error fetching subscription from user_subscriptions: ${fetchError.message}`);
    return;
  }

  // If no subscription record exists, create one
  if (!subscriptionData) {
    console.log(
        `No subscription found in user_subscriptions for stripe_subscription_id: ${subscriptionId}. ` +
        `Creating a new record.`
    );

    // Fetch the customer to get the user_id (if available in metadata or linked to a user)
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const userId = customer.metadata?.user_id || "anonymous"; // Fallback to "anonymous" if no user_id

    const newSubscriptionData = {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscriptionId,
      status: subscriptionStatus,
      type: subscriptionStatus === "trialing" ? "trial" : "paid",
      plan_variant: subscriptionType,
      current_period_end: currentPeriodEnd,
      expires_at: currentPeriodEnd,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { data: insertedData, error: insertError } = await supabase
        .from("user_subscriptions")
        .insert(newSubscriptionData)
        .select("user_id")
        .maybeSingle();

    if (insertError) {
      console.error(`Error creating subscription in user_subscriptions: ${insertError.message}`);
      return;
    }

    if (!insertedData) {
      console.error("Failed to create subscription record: No data returned after insert");
      return;
    }

    subscriptionData = insertedData;
    console.log(`Created new subscription record for user_id: ${subscriptionData.user_id}`);
  }

  console.log(`Found subscription for user_id: ${subscriptionData.user_id}`);

  // Update the subscription record
  console.log("Updating subscription in user_subscriptions...");
  const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: subscriptionStatus,
        plan_variant: subscriptionType,
        current_period_end: currentPeriodEnd,
        expires_at: currentPeriodEnd,
        updated_at: new Date(),
      })
      .eq("stripe_subscription_id", subscriptionId);

  if (updateError) {
    console.error(`Error updating subscription in user_subscriptions: ${updateError.message}`);
    return;
  }

  console.log("Subscription updated successfully.");

  // Update user profile (is_paid_user and role_expiry)
  const isActiveOrTrialing = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  console.log(`Updating user_profiles for user_id: ${subscriptionData.user_id}, is_paid_user: ${isActiveOrTrialing}`);
  const { error: profileUpdateError } = await supabase
      .from("user_profiles")
      .update({
        is_paid_user: isActiveOrTrialing,
        role_expiry: currentPeriodEnd,
      })
      .eq("user_id", subscriptionData.user_id);

  if (profileUpdateError) {
    console.error(`Error updating user_profiles: ${profileUpdateError.message}`);
    return;
  }

  console.log(`User profile updated successfully for subscription: ${subscriptionId}`);
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = customer?.email;
  console.log("Sending subsciption update email")
  console.log({customerEmail})
  if (customerEmail) {
    console.log("Sending subsciption update email +")
    // Fetch first_name from profiles table
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", subscriptionData.user_id)
        .maybeSingle();

    const userName = profileError || !profile?.first_name || profile.first_name === "Anonymous" ? "Customer" : profile.first_name;

    await Promise.all([
      sendSubscriptionEmail(customerEmail, subscriptionStatus, userName),
      manageContactList(customerEmail, subscriptionStatus)
    ]);
    console.log("Sent subsciption update email")
  }
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  const subscriptionId = subscription.id;

  // Update subscription status to canceled
  const { data: subscriptionData, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

  if (fetchError || !subscriptionData) {
    console.error(`Error fetching subscription for user update: ${fetchError?.message}`);
    return;
  }

  const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date(),
      })
      .eq("stripe_subscription_id", subscriptionId);

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