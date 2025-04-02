
// Datafast server-side tracking implementation

// Configuration
const DATAFAST_WEBSITE_ID = Deno.env.get("DATAFAST_WEBSITE_ID") || "";
const DATAFAST_API_ENDPOINT = "https://datafa.st/api/event";

// Function to send Datafast events via server-side tracking
export async function sendDatafastEvent(event: string, payload: Record<string, any>) {
  if (!DATAFAST_WEBSITE_ID) {
    console.error("Datafast tracking is not configured properly");
    return;
  }
  
  try {
    // Prepare request data
    const data = {
      website: DATAFAST_WEBSITE_ID,
      name: event,
      data: payload,
      url: "https://pedagoia.fr" // Use a default URL for server-side events
    };
    
    // Send request to Datafast API
    const response = await fetch(DATAFAST_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`Datafast API error: ${response.status} ${response.statusText}`);
      return;
    }
    
    console.log(`Datafast event '${event}' sent successfully for ${payload.email || 'user'}`);
  } catch (error) {
    console.error("Error sending Datafast event:", error);
  }
}

// Track signup event via Datafast
export async function trackSignupEvent(email: string) {
  await sendDatafastEvent("signup", { email });
}

// Track payment event via Datafast
export async function trackPaymentEvent(
  email: string,
  amount: number, 
  currency: string = "EUR",
  plan: string = "monthly",
  metadata: Record<string, any> = {}
) {
  await sendDatafastEvent("payment", {
    email,
    value: amount,
    currency,
    plan,
    ...metadata
  });
}
