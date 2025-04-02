
import { 
  processCustomerDetails, 
  trackCheckoutAnalytics, 
  calculateExpiryDate,
  findAndUpdateUserSubscription
} from '../services/paymentProcessorService.ts';

/**
 * Handle successful payment event (payment_intent.succeeded, charge.succeeded, or checkout.session.completed)
 */
export async function handlePaymentSuccess(paymentObject: any, stripe: any, supabase: any) {
  console.log('Processing payment success event');
  
  try {
    // Extract and process customer details from the payment object
    const {
      customerId,
      customerEmail,
      metadata,
      subscriptionType,
      amount,
      sessionId,
      clientReferenceId,
      subscriptionId
    } = await processCustomerDetails(paymentObject, stripe);
    
    // Need at least customer email or ID to proceed
    if (!customerEmail && !customerId) {
      console.error('No customer information found in payment object');
      console.log('Payment object:', JSON.stringify(paymentObject));
      return;
    }
    
    // For checkout.session events, track analytics immediately
    if (paymentObject.object === 'checkout.session') {
      await trackCheckoutAnalytics({
        customerEmail,
        customerId,
        clientReferenceId,
        sessionId,
        subscriptionId,
        subscriptionType,
        amount,
        metadata
      });
    }
    
    // Calculate subscription expiry date based on type
    const expiryDate = calculateExpiryDate(subscriptionType);
    
    // Find user and update their subscription
    if (customerEmail) {
      const success = await findAndUpdateUserSubscription(
        supabase,
        customerEmail,
        customerId,
        subscriptionType,
        expiryDate,
        {
          clientReferenceId,
          sessionId,
          subscriptionId,
          amount,
          metadata
        }
      );
      
      if (!success) {
        console.error(`Unable to find user for email ${customerEmail} or customer ${customerId}`);
      }
    } else {
      console.error(`No email available for customer ${customerId}, cannot update subscription`);
    }
    
  } catch (error) {
    console.error(`Error handling payment success: ${error.message}`, error);
  }
}
