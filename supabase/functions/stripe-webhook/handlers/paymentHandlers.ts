
import { updateOrCreateSubscription, updateUserInBrevoCRM } from '../helpers/subscriptionUtils.ts';
import { trackPurchaseEvent, trackSubscriptionEvent } from './measurementProtocol.ts';
import { trackPaymentEvent } from './datafastTracker.ts';

/**
 * Handle successful payment event (payment_intent.succeeded, charge.succeeded, or checkout.session.completed)
 */
export async function handlePaymentSuccess(paymentObject, stripe, supabase) {
  console.log('Processing payment success event');
  
  try {
    // Extract customer information
    let customerId, customerEmail, metadata, receipt_email, subscriptionType;
    let clientReferenceId, sessionId, subscriptionId, amount;
    
    // Different event types have different data structures
    if (paymentObject.object === 'payment_intent') {
      customerId = paymentObject.customer;
      metadata = paymentObject.metadata || {};
      subscriptionType = metadata.subscription_type || metadata.plan || 'monthly';
      customerEmail = paymentObject.receipt_email || metadata.email;
      amount = paymentObject.amount / 100; // Convert from cents to full currency unit
      sessionId = paymentObject.id;
      clientReferenceId = metadata.client_reference_id || `pi_${paymentObject.id}`;
      
      console.log(`Payment intent success for customer ${customerId} (${customerEmail}), type: ${subscriptionType}`);
    } 
    else if (paymentObject.object === 'charge') {
      customerId = paymentObject.customer;
      customerEmail = paymentObject.receipt_email || paymentObject.billing_details?.email;
      metadata = paymentObject.metadata || {};
      subscriptionType = metadata.subscription_type || metadata.plan || 'monthly';
      amount = paymentObject.amount / 100; // Convert from cents to full currency unit
      sessionId = paymentObject.id;
      clientReferenceId = metadata.client_reference_id || `ch_${paymentObject.id}`;
      
      console.log(`Charge success for customer ${customerId} (${customerEmail}), type: ${subscriptionType}`);
    }
    else if (paymentObject.object === 'checkout.session') {
      customerId = paymentObject.customer;
      customerEmail = paymentObject.customer_email || paymentObject.customer_details?.email;
      metadata = paymentObject.metadata || {};
      subscriptionType = metadata.subscription_type || metadata.plan || 'monthly';
      amount = paymentObject.amount_total / 100; // Convert from cents to full currency unit
      sessionId = paymentObject.id;
      clientReferenceId = paymentObject.client_reference_id || `cs_${paymentObject.id}`;
      subscriptionId = paymentObject.subscription;
      
      console.log(`Checkout session completed for customer ${customerId} (${customerEmail}), type: ${subscriptionType}`);
      
      // Track purchase via GA4 Measurement Protocol
      if (clientReferenceId) {
        // Extract UTM parameters from metadata
        const utmParams = {
          utm_source: metadata.utm_source,
          utm_medium: metadata.utm_medium,
          utm_campaign: metadata.utm_campaign,
          utm_content: metadata.utm_content,
          utm_term: metadata.utm_term
        };
        
        // Send server-side tracking event
        await trackPurchaseEvent(
          clientReferenceId,
          sessionId,
          subscriptionId,
          customerId,
          subscriptionType,
          amount,
          utmParams
        );
        
        console.log(`Tracked purchase event via Measurement Protocol for client ${clientReferenceId}`);
      }
      
      // Track payment via Datafast server-side tracking
      if (customerEmail) {
        await trackPaymentEvent(
          customerEmail,
          amount,
          "EUR",
          subscriptionType,
          {
            transaction_id: sessionId,
            customer_id: customerId,
            utm_source: metadata.utm_source,
            utm_medium: metadata.utm_medium,
            utm_campaign: metadata.utm_campaign
          }
        );
        console.log(`Tracked payment event via Datafast for user ${customerEmail}`);
      }
    }
    else {
      console.log(`Unhandled payment object type: ${paymentObject.object}`);
      return;
    }
    
    // Need at least customer email or ID to proceed
    if (!customerEmail && !customerId) {
      console.error('No customer information found in payment object');
      console.log('Payment object:', JSON.stringify(paymentObject));
      return;
    }
    
    // If we only have customer ID, try to get email
    if (customerId && !customerEmail) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        customerEmail = customer.email;
        console.log(`Retrieved customer email ${customerEmail} for customer ${customerId}`);
      } catch (err) {
        console.error(`Error retrieving customer: ${err.message}`);
      }
    }
    
    // Calculate subscription expiry date based on type
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (subscriptionType === 'yearly') {
      expiryDate.setFullYear(now.getFullYear() + 1);
    } else {
      // Default to monthly
      expiryDate.setMonth(now.getMonth() + 1);
    }
    
    console.log(`Setting expiration date to ${expiryDate.toISOString()} for ${subscriptionType} plan`);
    
    // Find user by email if we don't have customer ID
    if (!customerId && customerEmail) {
      try {
        // First try to get user profile by email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, stripe_customer_id')
          .eq('email', customerEmail)
          .maybeSingle();
          
        if (userError) {
          console.error('Error fetching user by email:', userError);
        } else if (userData) {
          customerId = userData.stripe_customer_id || customerId;
          
          // If user doesn't have a Stripe customer ID yet, update it
          if (userData.id && customerId && !userData.stripe_customer_id) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', userData.id);
              
            if (updateError) {
              console.error('Error updating stripe_customer_id:', updateError);
            } else {
              console.log(`Updated stripe_customer_id for user ${userData.id}`);
            }
          }
        }
      } catch (err) {
        console.error(`Error looking up user by email: ${err.message}`);
      }
    }
    
    // Next, try to find the user from auth.users if the email wasn't found in profiles
    if (customerEmail) {
      try {
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
          
          // Update subscription with user ID and customer ID
          console.log("updateOrCreateSubscription")
          await updateOrCreateSubscription(supabase, userId, customerId, subscriptionType, expiryDate);
          
          // Update user in Brevo CRM
          if (customerEmail) {
            await updateUserInBrevoCRM(supabase, customerEmail);
          }
          
          // Track subscription event via GA4 Measurement Protocol
          if (clientReferenceId && subscriptionId) {
            await trackSubscriptionEvent(
              clientReferenceId,
              subscriptionId,
              customerId,
              "active",
              subscriptionType,
              amount
            );
            
            console.log(`Tracked subscription event via Measurement Protocol for client ${clientReferenceId}`);
          }
          
          // Track payment via Datafast for payment_intent and charge events if not tracked yet
          if (customerEmail && (paymentObject.object === 'payment_intent' || paymentObject.object === 'charge')) {
            await trackPaymentEvent(
              customerEmail,
              amount,
              "EUR",
              subscriptionType,
              {
                transaction_id: sessionId,
                customer_id: customerId,
                utm_source: metadata.utm_source,
                utm_medium: metadata.utm_medium,
                utm_campaign: metadata.utm_campaign
              }
            );
            console.log(`Tracked payment event via Datafast for user ${customerEmail}`);
          }
          
          console.log(`Successfully processed payment for ${customerEmail} (${subscriptionType})`);
          return;
        }
      } catch (err) {
        console.error(`Error in auth lookup: ${err.message}`);
      }
    }
    
    // If we got here, we were unable to find the user
    console.error(`Unable to find user for email ${customerEmail} or customer ${customerId}`);
    
  } catch (error) {
    console.error(`Error handling payment success: ${error.message}`, error);
  }
}
