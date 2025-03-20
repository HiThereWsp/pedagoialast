
import { updateOrCreateSubscription, updateUserInBrevoCRM } from '../helpers/subscriptionUtils.ts';

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
    await updateUserInBrevoCRM(supabase, customerEmail);
    
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}
