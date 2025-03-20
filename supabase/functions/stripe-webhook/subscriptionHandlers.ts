import { getSupabaseClient } from './utils.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutCompleted(session, stripe) {
  console.log('Processing checkout.session.completed event');
  
  try {
    // Get customer information
    const customer = session.customer;
    const supabase = getSupabaseClient();
    
    if (!customer) {
      console.error('No customer ID found in checkout session');
      return;
    }
    
    // Get payment intent details
    const paymentIntentId = session.payment_intent;
    if (!paymentIntentId) {
      console.error('No payment intent ID in checkout session');
      return;
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      console.error('Could not retrieve payment intent');
      return;
    }
    
    // Extract URL parameters from the success URL if present
    let subscriptionType = 'monthly'; // Default
    if (session.success_url) {
      try {
        const successUrl = new URL(session.success_url);
        const planParam = successUrl.searchParams.get('plan');
        if (planParam === 'yearly' || planParam === 'monthly') {
          subscriptionType = planParam;
          console.log(`Found subscription type from URL param: ${subscriptionType}`);
        }
      } catch (urlError) {
        console.error('Error parsing success_url:', urlError);
      }
    }
    
    // Determine subscription type from payment amount if not found in URL
    if (!subscriptionType) {
      const amount = paymentIntent.amount / 100; // Convert cents to whole currency
      
      // Use amount to determine if it's monthly or yearly
      // These thresholds should match your pricing
      if (amount >= 90) { // Yearly subscription (approximately)
        subscriptionType = 'yearly';
      } else { // Monthly subscription
        subscriptionType = 'monthly';
      }
    }
    
    // Calculate expiry date based on subscription type
    let expiryDate = new Date();
    if (subscriptionType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now
    } else { // monthly
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
    }
    
    // Get the customer object to retrieve email
    const customerObj = await stripe.customers.retrieve(customer);
    const customerEmail = customerObj.email;
    
    if (!customerEmail) {
      console.error('No email found for customer');
      return;
    }
    
    console.log(`Customer email: ${customerEmail}, Subscription type: ${subscriptionType}, Expires: ${expiryDate}`);
    
    // Try to find user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();
    
    if (userError || !userData) {
      console.error('Could not find user by email:', userError || 'No user found');
      return;
    }
    
    const userId = userData.id;
    
    // Check if there's an existing subscription
    const { data: existingSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('type', 'paid')
      .maybeSingle();
    
    if (subError) {
      console.error('Error checking existing subscription:', subError);
      return;
    }
    
    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          plan_variant: subscriptionType,
          stripe_customer_id: customer,
          current_period_end: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);
      
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return;
      }
      
      console.log(`Updated subscription for user ${userId} (${subscriptionType})`);
    } else {
      // Create a new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          type: 'paid',
          status: 'active',
          plan_variant: subscriptionType,
          stripe_customer_id: customer,
          current_period_end: expiryDate.toISOString()
        });
      
      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return;
      }
      
      console.log(`Created new subscription for user ${userId} (${subscriptionType})`);
    }
    
    // Attempt to update user's subscription type in Brevo
    try {
      await supabase.functions.invoke('create-brevo-contact', {
        body: {
          email: customerEmail,
          userType: "premium",
          source: "payment_successful"
        }
      });
      console.log('Updated user in Brevo CRM');
    } catch (brevoError) {
      console.error('Error updating user in Brevo:', brevoError);
      // Continue despite Brevo error
    }
    
  } catch (error) {
    console.error('Error processing checkout completed:', error);
  }
}

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
    try {
      await supabase.functions.invoke('create-brevo-contact', {
        body: {
          email: userEmail,
          userType: "premium",
          source: "subscription_created"
        }
      });
      console.log('Updated user in Brevo CRM');
    } catch (brevoError) {
      console.error('Error updating user in Brevo:', brevoError);
      // Continue despite Brevo error
    }

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
