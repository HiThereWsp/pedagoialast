
// GA4 Measurement Protocol helper

// Configuration
const GA4_API_SECRET = Deno.env.get("GA4_API_SECRET") || "";
const GA4_MEASUREMENT_ID = Deno.env.get("GA4_MEASUREMENT_ID") || "";

// Function to send GA4 events via the Measurement Protocol
export async function sendGA4Event(clientId: string, events: any[]) {
  if (!GA4_API_SECRET || !GA4_MEASUREMENT_ID) {
    console.error("GA4 Measurement Protocol is not configured properly");
    return;
  }
  
  try {
    // Measurement Protocol endpoint
    const endpoint = `https://www.google-analytics.com/mp/collect?api_secret=${GA4_API_SECRET}&measurement_id=${GA4_MEASUREMENT_ID}`;
    
    // Request body
    const body = {
      client_id: clientId, 
      user_id: clientId,
      events: events,
      // For non-web contexts
      non_personalized_ads: false
    };
    
    // Send request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error(`GA4 Measurement Protocol error: ${response.status} ${response.statusText}`);
      return;
    }
    
    console.log(`GA4 Measurement Protocol event sent successfully for client ${clientId}`);
  } catch (error) {
    console.error("Error sending GA4 Measurement Protocol event:", error);
  }
}

// Track a purchase event via Measurement Protocol
export async function trackPurchaseEvent(
  clientId: string,
  sessionId: string,
  subscriptionId: string,
  customerId: string,
  subscriptionType: string,
  amount: number,
  utmParams: Record<string, string> = {}
) {
  // Create purchase event
  const purchaseEvent = {
    name: 'purchase',
    params: {
      transaction_id: sessionId,
      subscription_id: subscriptionId,
      customer_id: customerId,
      value: amount,
      currency: 'EUR',
      items: [
        {
          item_name: `Abonnement PedagoIA (${subscriptionType})`,
          item_id: subscriptionType,
          price: amount,
          quantity: 1
        }
      ],
      // Add UTM parameters if available
      ...(utmParams.utm_source && { utm_source: utmParams.utm_source }),
      ...(utmParams.utm_medium && { utm_medium: utmParams.utm_medium }),
      ...(utmParams.utm_campaign && { utm_campaign: utmParams.utm_campaign }),
      ...(utmParams.utm_content && { utm_content: utmParams.utm_content }),
      ...(utmParams.utm_term && { utm_term: utmParams.utm_term })
    }
  };
  
  // Send the event
  await sendGA4Event(clientId, [purchaseEvent]);
}

// Track a subscription event via Measurement Protocol
export async function trackSubscriptionEvent(
  clientId: string, 
  subscriptionId: string,
  customerId: string,
  status: string,
  subscriptionType: string,
  amount: number
) {
  // Create subscription event
  const subscriptionEvent = {
    name: 'subscription',
    params: {
      subscription_id: subscriptionId,
      customer_id: customerId,
      status: status,
      value: amount,
      currency: 'EUR',
      subscription_type: subscriptionType
    }
  };
  
  // Send the event
  await sendGA4Event(clientId, [subscriptionEvent]);
}
