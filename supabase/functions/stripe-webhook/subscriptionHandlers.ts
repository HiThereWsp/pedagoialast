
import { getSupabaseClient } from './utils.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Handle successful payment event (payment_intent.succeeded, charge.succeeded, or checkout.session.completed)
 */
export async function handlePaymentSuccess(paymentObject, stripe, supabase) {
  console.log('Processing payment success event');
  console.log('Payment data:', JSON.stringify(paymentObject, null, 2));
  
  try {
    // Extract payment information based on event type
    let customerEmail = null;
    let customerId = null;
    let paymentAmount = 0;
    let subscriptionType = 'monthly'; // Default type
    let metadata = {};
    
    // Extract data based on the object type
    if (paymentObject.object === 'payment_intent') {
      // Handle payment_intent.succeeded
      customerId = paymentObject.customer;
      paymentAmount = paymentObject.amount;
      metadata = paymentObject.metadata || {};
      
      // Retrieve invoice to get additional data if this is a subscription payment
      if (paymentObject.invoice) {
        try {
          const invoice = await stripe.invoices.retrieve(paymentObject.invoice);
          if (invoice && invoice.customer_email) {
            customerEmail = invoice.customer_email;
          }
        } catch (invoiceError) {
          console.error('Error retrieving invoice:', invoiceError);
        }
      }
    } else if (paymentObject.object === 'charge') {
      // Handle charge.succeeded
      customerId = paymentObject.customer;
      paymentAmount = paymentObject.amount;
      metadata = paymentObject.metadata || {};
      
      // Check billing details for email
      if (paymentObject.billing_details && paymentObject.billing_details.email) {
        customerEmail = paymentObject.billing_details.email;
      }
    } else if (paymentObject.object === 'checkout.session') {
      // Handle checkout.session.completed (legacy support)
      customerId = paymentObject.customer;
      customerEmail = paymentObject.customer_email || 
                     (paymentObject.customer_details ? paymentObject.customer_details.email : null);
      metadata = paymentObject.metadata || {};
      
      // Get payment intent to retrieve amount
      if (paymentObject.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentObject.payment_intent);
          if (paymentIntent) {
            paymentAmount = paymentIntent.amount;
          }
        } catch (paymentIntentError) {
          console.error('Error retrieving payment intent:', paymentIntentError);
        }
      }
    } else {
      console.error('Unknown payment object type:', paymentObject.object);
      return;
    }
    
    // If we still don't have customer email, try to retrieve from customer object
    if (!customerEmail && customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && customer.email) {
          customerEmail = customer.email;
        }
      } catch (customerError) {
        console.error('Error retrieving customer:', customerError);
      }
    }
    
    if (!customerEmail) {
      console.error('Could not find customer email from any source');
      return;
    }
    
    console.log(`Customer found: ${customerId} with email ${customerEmail}`);
    
    // Determine subscription type from various sources
    
    // Method 1: Check URL params if they were passed in metadata
    if (metadata.plan) {
      subscriptionType = metadata.plan === 'yearly' ? 'yearly' : 'monthly';
      console.log(`Found subscription type from metadata: ${subscriptionType}`);
    }
    
    // Method 2: Use payment amount to determine plan type if not found yet
    if ((!metadata.plan || subscriptionType === 'monthly') && paymentAmount) {
      const amount = paymentAmount / 100; // Convert cents to whole currency units
      console.log(`Using payment amount to determine subscription type: ${amount}`);
      
      // These thresholds should match your pricing
      if (amount >= 90) { 
        // Yearly subscription (approximately)
        subscriptionType = 'yearly';
        console.log(`Detected yearly subscription based on amount: ${amount}`);
      }
    }
    
    // Calculate expiry date based on subscription type
    let expiryDate = new Date();
    if (subscriptionType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now
    } else { // monthly
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
    }
    
    console.log(`Customer email: ${customerEmail}, Subscription type: ${subscriptionType}, Expires: ${expiryDate}`);
    
    // Try to find user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('email', customerEmail)
      .maybeSingle();
    
    if (userError) {
      console.error('Could not find user by email:', userError);
      
      // Try to find user using auth.users table through RPC function if available
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({
          filters: {
            email: customerEmail
          }
        });
        
        if (authError || !authUser || authUser.users.length === 0) {
          console.error('Could not find user in auth.users:', authError || 'No users found');
          return;
        }
        
        const userId = authUser.users[0].id;
        console.log(`Found user by auth.users: ${userId}`);
        
        await updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate);
      } catch (adminError) {
        console.error('Error using admin API:', adminError);
        return;
      }
    } else if (!userData) {
      console.error('No user found for email:', customerEmail);
      return;
    } else {
      // Use user_id if available, otherwise use id
      const userId = userData.user_id || userData.id;
      await updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate);
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
    console.error('Error processing payment success:', error);
  }
}

/**
 * Helper function to update or create a subscription
 */
async function updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate) {
  // First try with user_subscriptions table (new schema)
  try {
    // Check if there's an existing subscription
    const { data: existingSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('type', 'paid')
      .maybeSingle();
    
    if (subError) {
      console.error('Error checking existing subscription in user_subscriptions:', subError);
    } else {
      if (existingSub) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            plan_variant: subscriptionType,
            stripe_customer_id: customerId,
            current_period_end: expiryDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);
        
        if (updateError) {
          console.error('Error updating subscription in user_subscriptions:', updateError);
        } else {
          console.log(`Updated subscription for user ${userId} (${subscriptionType}) in user_subscriptions`);
          return; // Success, exit early
        }
      } else {
        // Create a new subscription
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            type: 'paid',
            status: 'active',
            plan_variant: subscriptionType,
            stripe_customer_id: customerId,
            current_period_end: expiryDate.toISOString()
          });
        
        if (insertError) {
          console.error('Error creating subscription in user_subscriptions:', insertError);
        } else {
          console.log(`Created new subscription for user ${userId} (${subscriptionType}) in user_subscriptions`);
          return; // Success, exit early
        }
      }
    }
  } catch (newTableError) {
    console.error('Error with user_subscriptions table:', newTableError);
    // Continue to try the subscriptions table as fallback
  }
  
  // Fallback to subscriptions table (legacy schema)
  try {
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (subError) {
      console.error('Error checking existing subscription in subscriptions:', subError);
      return;
    }
    
    if (existingSub) {
      // Update existing subscription
      const { data: updateData, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: subscriptionType,
          current_period_end: expiryDate.toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select();
      
      if (updateError) {
        console.error('Error updating subscription in subscriptions:', updateError);
        return;
      }
      
      console.log(`Updated subscription for user ${userId} (${subscriptionType}) in subscriptions`);
    } else {
      // Create a new subscription
      const { data: newSubscription, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          plan_type: subscriptionType,
          current_period_end: expiryDate.toISOString(),
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      
      if (createError) {
        console.error('Error creating subscription in subscriptions:', createError);
        return;
      }
      
      console.log(`Created new subscription for user ${userId} (${subscriptionType}) in subscriptions`);
    }
    
    // Log the event in user_events if the table exists
    try {
      await supabase
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: 'subscription_payment_processed',
          metadata: {
            plan_type: subscriptionType,
            payment_processed: true,
            timestamp: new Date().toISOString()
          }
        });
      console.log('Logged payment event in user_events');
    } catch (logError) {
      console.error('Error logging payment event:', logError);
      // Continue despite logging error
    }
  } catch (legacyTableError) {
    console.error('Error with subscriptions table:', legacyTableError);
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
