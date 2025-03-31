
// Interface for the Checkout Session data
export interface CheckoutSessionData {
  subscriptionType: string;
  planName: string;
  amount: number;
  trialEnd?: string; // ISO date string
  nextBillingDate: string; // ISO date string
  customerEmail: string;
  metadata?: Record<string, string>;
  clientReferenceId?: string;
  sessionId: string;
  customerId: string;
  subscriptionId: string;
}
