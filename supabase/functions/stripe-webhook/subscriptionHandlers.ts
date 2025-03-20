
import { getSupabaseClient } from './utils.ts';
import { handlePaymentSuccess } from './handlers/paymentHandlers.ts';
import { 
  handleSubscriptionCreated, 
  handleSubscriptionUpdated, 
  handleSubscriptionDeleted 
} from './handlers/subscriptionLifecycleHandlers.ts';

// Export all handlers so they can be accessed from the index.ts file
export {
  handlePaymentSuccess,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted
};
