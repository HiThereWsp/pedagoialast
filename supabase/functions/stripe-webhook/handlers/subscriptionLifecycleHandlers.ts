
import { updateUserInBrevoCRM } from '../helpers/subscriptionUtils.ts';

/**
 * Handle customer.subscription.created event
 */
export async function handleSubscriptionCreated(subscription, stripe) {
  console.log('Handling customer.subscription.created event');

  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const subscriptionStatus = subscription.status;
  const planId = subscription.plan?.id;
  const productId = subscription.plan?.product;
  const subscriptionType = subscription.metadata?.subscription_type;
  const testMode = subscription.metadata?.test_mode === 'true';

  console.log(`Subscription created for customer ${customerId} with subscription ID ${subscriptionId}`);
  console.log(`Subscription status: ${subscriptionStatus}, Plan ID: ${planId}, Product ID: ${productId}`);
  console.log(`Subscription type from metadata: ${subscriptionType}, Test mode: ${testMode}`);

  try {
    const supabase = getSupabaseClient();

    // Retrieve the user ID from the profiles table using the Stripe customer ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile by Stripe customer ID:', profileError);
      return;
    }

    if (!profileData) {
      console.error('No profile found for Stripe customer ID:', customerId);
      return;
    }

    const userId = profileData.id;
    const userEmail = profileData.email;

    console.log(`Found user ID ${userId} for Stripe customer ${customerId}`);

    // Get the current period end date
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Insert a new row in the user_subscriptions table
    const { data: subscriptionData, error: subscriptionInsertError } = await supabase
      .from('user_subscriptions')
      .insert([
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscriptionStatus,
          type: subscriptionType || 'paid',
          plan_id: planId,
          product_id: productId,
          current_period_end: currentPeriodEnd,
          test_mode: testMode,
        },
      ])
      .select('*');

    if (subscriptionInsertError) {
      console.error('Error inserting subscription:', subscriptionInsertError);
      return;
    }

    console.log('Inserted subscription:', subscriptionData);

    // Attempt to update user's subscription type in Brevo
    await updateUserInBrevoCRM(supabase, userEmail, "premium", "subscription_created");

  } catch (error) {
    console.error('Error handling subscription created event:', error);
  }
}

/**
 * Handle customer.subscription.updated event
 */
export async function handleSubscriptionUpdated(subscription) {
  console.log('Handling customer.subscription.updated event');

  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const subscriptionStatus = subscription.status;
  const planId = subscription.plan?.id;
  const productId = subscription.plan?.product;
  const subscriptionType = subscription.metadata?.subscription_type;
  const testMode = subscription.metadata?.test_mode === 'true';

  console.log(`Subscription updated for customer ${customerId} with subscription ID ${subscriptionId}`);
  console.log(`Subscription status: ${subscriptionStatus}, Plan ID: ${planId}, Product ID: ${productId}`);
  console.log(`Subscription type from metadata: ${subscriptionType}, Test mode: ${testMode}`);

  try {
    const supabase = getSupabaseClient();

    // Get the current period end date
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Update the row in the user_subscriptions table
    const { data: subscriptionData, error: subscriptionUpdateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscriptionStatus,
        type: subscriptionType || 'paid',
        plan_id: planId,
        product_id: productId,
        current_period_end: currentPeriodEnd,
        test_mode: testMode,
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select('*');

    if (subscriptionUpdateError) {
      console.error('Error updating subscription:', subscriptionUpdateError);
      return;
    }

    console.log('Updated subscription:', subscriptionData);
  } catch (error) {
    console.error('Error handling subscription updated event:', error);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(subscription) {
  console.log('Handling customer.subscription.deleted event');

  const customerId = subscription.customer;
  const subscriptionId = subscription.id;

  console.log(`Subscription deleted for customer ${customerId} with subscription ID ${subscriptionId}`);

  try {
    const supabase = getSupabaseClient();

    // Update the row in the user_subscriptions table to mark the subscription as canceled
    const { data: subscriptionData, error: subscriptionDeleteError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select('*');

    if (subscriptionDeleteError) {
      console.error('Error deleting subscription:', subscriptionDeleteError);
      return;
    }

    console.log('Deleted subscription:', subscriptionData);
  } catch (error) {
    console.error('Error handling subscription deleted event:', error);
  }
}

// Import statement was missing in the source, adding it here
import { getSupabaseClient } from '../utils.ts';
