import { getSupabaseClient } from '../utils.ts';

/**
 * Handle subscription creation event (customer.subscription.created)
 */
export async function handleSubscriptionCreated(subscription: any, stripe: any) {
  console.log('Processing subscription created event');
  
  try {
    // Extract customer information
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const metadata = subscription.metadata || {};
    const subscriptionType = metadata.subscription_type || metadata.plan || 'monthly';
    
    console.log(`New subscription created: ${subscriptionId} for customer ${customerId}, type: ${subscriptionType}, status: ${status}`);
    
    // Get customer details from Stripe
    if (customerId && stripe) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer.email;
        
        if (customerEmail) {
          console.log(`Retrieved customer email ${customerEmail} for customer ${customerId}`);
          
          // Update user subscription in database
          const supabase = getSupabaseClient();
          
          // Find user by email
          const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
            filter: {
              email: customerEmail
            }
          });
          
          if (usersError) {
            console.error('Error fetching user from auth:', usersError);
          } else if (users && users.length > 0) {
            const userId = users[0].id;
            console.log(`Found user ID ${userId} for email ${customerEmail}`);
            
            // Calculate expiry date
            const now = new Date();
            const expiryDate = new Date(now);
            
            if (subscriptionType === 'yearly') {
              expiryDate.setFullYear(now.getFullYear() + 1);
            } else {
              // Default to monthly
              expiryDate.setMonth(now.getMonth() + 1);
            }
            
            // Update subscription in database
            const { error: updateError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_type: subscriptionType,
                status: status,
                expires_at: expiryDate.toISOString(),
                metadata: metadata
              });
              
            if (updateError) {
              console.error('Error updating subscription:', updateError);
            } else {
              console.log(`Successfully updated subscription for user ${userId}`);
              
              // Update user profile with subscription info
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                  stripe_customer_id: customerId,
                  is_paid_user: true,
                  subscription_type: subscriptionType
                })
                .eq('id', userId);
                
              if (profileError) {
                console.error('Error updating user profile:', profileError);
              } else {
                console.log(`Successfully updated profile for user ${userId}`);
              }
            }
          } else {
            console.log(`No user found for email ${customerEmail}`);
          }
        }
      } catch (err) {
        console.error(`Error retrieving customer: ${err.message}`);
      }
    }
  } catch (error) {
    console.error(`Error handling subscription created: ${error.message}`, error);
  }
}

/**
 * Handle subscription update event (customer.subscription.updated)
 */
export async function handleSubscriptionUpdated(subscription: any) {
  console.log('Processing subscription updated event');
  
  try {
    // Extract subscription information
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const metadata = subscription.metadata || {};
    
    console.log(`Subscription updated: ${subscriptionId}, status: ${status}`);
    
    // Update subscription in database
    const supabase = getSupabaseClient();
    
    // Find subscription by ID
    const { data: existingSubscription, error: findError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (existingSubscription) {
      const userId = existingSubscription.user_id;
      
      // Update subscription status
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: status,
          metadata: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
      } else {
        console.log(`Successfully updated subscription ${subscriptionId} for user ${userId}`);
        
        // If subscription is canceled or unpaid, update user profile
        if (status === 'canceled' || status === 'unpaid') {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              is_paid_user: false
            })
            .eq('id', userId);
            
          if (profileError) {
            console.error('Error updating user profile:', profileError);
          } else {
            console.log(`Updated profile for user ${userId} - subscription inactive`);
          }
        } else if (status === 'active') {
          // If subscription is active, ensure user is marked as paid
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              is_paid_user: true
            })
            .eq('id', userId);
            
          if (profileError) {
            console.error('Error updating user profile:', profileError);
          } else {
            console.log(`Updated profile for user ${userId} - subscription active`);
          }
        }
      }
    } else {
      console.log(`No existing subscription found for ${subscriptionId}`);
    }
  } catch (error) {
    console.error(`Error handling subscription updated: ${error.message}`, error);
  }
}

/**
 * Handle subscription deletion event (customer.subscription.deleted)
 */
export async function handleSubscriptionDeleted(subscription: any) {
  console.log('Processing subscription deleted event');
  
  try {
    // Extract subscription information
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    
    console.log(`Subscription deleted: ${subscriptionId} for customer ${customerId}`);
    
    // Update subscription in database
    const supabase = getSupabaseClient();
    
    // Find subscription by ID
    const { data: existingSubscription, error: findError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (existingSubscription) {
      const userId = existingSubscription.user_id;
      
      // Update subscription status to canceled
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
          canceled_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
      } else {
        console.log(`Marked subscription ${subscriptionId} as canceled for user ${userId}`);
        
        // Update user profile to reflect canceled subscription
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_paid_user: false
          })
          .eq('id', userId);
          
        if (profileError) {
          console.error('Error updating user profile:', profileError);
        } else {
          console.log(`Updated profile for user ${userId} - subscription canceled`);
        }
      }
    } else {
      console.log(`No existing subscription found for ${subscriptionId}`);
    }
  } catch (error) {
    console.error(`Error handling subscription deleted: ${error.message}`, error);
  }
}
