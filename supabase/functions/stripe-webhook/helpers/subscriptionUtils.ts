
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Helper function to update or create a subscription
 */
export async function updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate) {
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
 * Update user in Brevo CRM
 */
export async function updateUserInBrevoCRM(supabase, customerEmail, userType = "premium", source = "payment_successful") {
  try {
    await supabase.functions.invoke('create-brevo-contact', {
      body: {
        email: customerEmail,
        userType,
        source
      }
    });
    console.log('Updated user in Brevo CRM');
    return true;
  } catch (brevoError) {
    console.error('Error updating user in Brevo:', brevoError);
    return false;
  }
}
