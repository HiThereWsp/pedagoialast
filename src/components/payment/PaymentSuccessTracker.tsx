
import { useEffect } from "react";
import { CheckoutSessionData } from "@/types/checkout-session";
import { trackPurchaseConversion } from "@/integrations/google-analytics/client";
import { facebookEvents } from "@/integrations/meta-pixel/client";
import { subscriptionEvents } from "@/integrations/posthog/events";

interface PaymentSuccessTrackerProps {
  sessionData: CheckoutSessionData | null;
  subscriptionType: string;
  clientId?: string;
}

export const PaymentSuccessTracker = ({ 
  sessionData, 
  subscriptionType, 
  clientId 
}: PaymentSuccessTrackerProps) => {
  useEffect(() => {
    const trackPaymentSuccess = async () => {
      try {
        if (!sessionData) return;

        // Track Google Analytics conversion with enhanced data
        trackPurchaseConversion(
          sessionData.sessionId || '',
          sessionData.amount,
          'EUR',
          sessionData.subscriptionType,
          clientId || sessionData.clientReferenceId
        );
        
        // Calculating yearly value for tracking
        const yearlyValue = subscriptionType === "monthly" 
          ? sessionData.amount * 12 
          : sessionData.amount;
        
        // Send subscription success event to Facebook
        facebookEvents.subscriptionSuccess(
          subscriptionType as 'monthly' | 'yearly',
          sessionData.amount,
          yearlyValue
        );
        
        // Tracking PostHog with enhanced data
        subscriptionEvents.subscriptionCompleted(
          subscriptionType as 'monthly' | 'yearly',
          sessionData.amount,
          {
            session_id: sessionData.sessionId,
            customer_id: sessionData.customerId,
            plan_name: sessionData.planName,
            client_id: clientId || sessionData.clientReferenceId,
            metadata: sessionData.metadata
          }
        );
      } catch (error) {
        console.error("Error in payment success tracking:", error);
      }
    };

    trackPaymentSuccess();
  }, [sessionData, subscriptionType, clientId]);

  return null;
};
