import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyUserEmail, ensureUserProfile } from './emailVerification.ts';

/**
 * Helper function to update or create a subscription
 */
export async function updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate) {
  if (!userId) {
    console.error('No user ID provided for subscription update');
    return false;
  }
  
  // Verify user if needed - import from emailVerification.ts
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      filter: {
        id: userId
      }
    });
    
    if (!usersError && users && users.length > 0) {
      const user = users[0];
      
      // Attempt to verify email if it's not already verified
      if (user.email && !user.email_confirmed_at) {
        console.log(`Attempting to verify email ${user.email} during subscription update`);
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        );
        
        if (updateError) {
          console.error(`Failed to verify email during subscription: ${updateError.message}`);
        } else {
          console.log(`Successfully verified email ${user.email} during subscription update`);
        }
      }
      
      // Ensure profile exists
      try {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error(`Error checking profile: ${profileError.message}`);
        } else if (!profile) {
          console.log(`Creating profile for user ${userId}`);
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              first_name: user.user_metadata?.first_name || 'User',
              stripe_customer_id: customerId
            });
        } else if (customerId) {
          // Update Stripe customer ID if needed
          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        }
      } catch (profileErr) {
        console.error(`Error managing profile: ${profileErr.message}`);
      }
    }
  } catch (err) {
    console.error(`Error verifying user: ${err.message}`);
  }
  
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
          return true; // Success, exit early
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
          console.log(`Created new subscription for user 1 ${userId} (${subscriptionType}) in user_subscriptions`);
          return true; // Success, exit early
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
      return false;
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
        return false;
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
        return false;
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

  return false;
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
