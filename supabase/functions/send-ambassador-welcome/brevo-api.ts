
import { corsHeaders } from '../_shared/cors.ts';

// Constants
export const BREVO_AMBASSADOR_LIST_ID = 10; // Updated to match the new ambassador list ID

/**
 * Checks if a welcome email was already sent to the contact
 * @param email Contact email to check
 * @param apiKey Brevo API key
 * @param requestId Unique request identifier for logging
 * @returns Boolean indicating if welcome email was already sent
 */
export async function checkPreviousWelcomeEmail(
  email: string, 
  apiKey: string, 
  requestId: string
): Promise<boolean> {
  console.log(`[${requestId}] 🔍 Checking if welcome email was already sent to ${email}`);
  try {
    const checkStartTime = Date.now();
    const checkResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "api-key": apiKey,
      }
    });
    
    console.log(`[${requestId}] Brevo contact check response status: ${checkResponse.status} (took ${Date.now() - checkStartTime}ms)`);
    
    if (checkResponse.ok) {
      const contactData = await checkResponse.json();
      console.log(`[${requestId}] Contact data retrieved for ${email}`, {
        attributes: contactData.attributes || 'none',
        listIds: contactData.listIds || 'none',
      });
      
      if (contactData.attributes && contactData.attributes.WELCOME_EMAIL_SENT === "true") {
        console.log(`[${requestId}] ⚠️ Welcome email already sent to ${email}, skipping.`);
        return true;
      } else {
        console.log(`[${requestId}] ✅ Welcome email not sent yet to ${email}, proceeding.`);
        return false;
      }
    } else {
      // If contact doesn't exist or there's an error, we'll proceed with sending
      const errorText = await checkResponse.text();
      console.log(`[${requestId}] Could not check contact status (${checkResponse.status}): ${errorText}. Will send email anyway.`);
      return false;
    }
  } catch (e) {
    // If we can't check, we'll proceed with sending anyway
    console.error(`[${requestId}] ❌ Error checking contact attributes:`, e);
    console.log(`[${requestId}] Will proceed with sending email despite check error`);
    return false;
  }
}

/**
 * Sends an ambassador welcome email via Brevo API
 * @param email Recipient email
 * @param firstName Recipient first name
 * @param htmlContent Email HTML content
 * @param apiKey Brevo API key
 * @param requestId Unique request identifier for logging
 * @returns Response object from Brevo API
 */
export async function sendBrevoEmail(
  email: string, 
  firstName: string, 
  htmlContent: string, 
  apiKey: string,
  requestId: string
): Promise<Response> {
  console.log(`[${requestId}] 📤 Attempting to send welcome email to ${email}`);
  const sendStartTime = Date.now();
  
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "PedagoIA",
        email: "contact@pedagoia.fr"
      },
      to: [{
        email: email,
        name: firstName || "Ambassadeur PedagoIA"
      }],
      subject: "Bienvenue dans le programme Ambassadeur PedagoIA !",
      htmlContent: htmlContent,
      replyTo: {
        email: "contact@pedagoia.fr",
        name: "Support PedagoIA"
      }
    }),
  });

  console.log(`[${requestId}] Brevo email API response status: ${response.status} (took ${Date.now() - sendStartTime}ms)`);
  return response;
}

/**
 * Updates contact attributes in Brevo to mark welcome email as sent
 * @param email Contact email to update
 * @param apiKey Brevo API key
 * @param requestId Unique request identifier for logging
 * @returns Response object from Brevo API
 */
export async function updateContactAttributes(
  email: string, 
  apiKey: string,
  requestId: string
): Promise<Response> {
  console.log(`[${requestId}] 📝 Updating contact attributes in Brevo to mark welcome email as sent`);
  
  const updateStartTime = Date.now();
  const updateResponse = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email: email,
      attributes: {
        WELCOME_EMAIL_SENT: "true",
        WELCOME_EMAIL_DATE: new Date().toISOString(),
        TYPE_UTILISATEUR: "ambassador"
      },
      listIds: [BREVO_AMBASSADOR_LIST_ID],
      updateEnabled: true
    }),
  });
  
  const updateStatus = updateResponse.status;
  console.log(`[${requestId}] Brevo contact update response status: ${updateStatus} (took ${Date.now() - updateStartTime}ms)`);
  
  if (updateResponse.ok) {
    console.log(`[${requestId}] ✅ Contact ${email} successfully updated with WELCOME_EMAIL_SENT=true`);
  } else {
    const updateError = await updateResponse.text();
    console.error(`[${requestId}] ⚠️ Error updating contact attributes:`, {
      status: updateStatus,
      error: updateError
    });
    console.log(`[${requestId}] Will continue despite contact update error`);
  }
  
  return updateResponse;
}

/**
 * Creates an error response with CORS headers
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @param requestId Unique request identifier
 * @returns Response object with error details
 */
export function createErrorResponse(
  message: string,
  status: number,
  details: string,
  requestId: string
): Response {
  return new Response(JSON.stringify({ 
    error: message, 
    details: details,
    status: status,
    requestId: requestId
  }), {
    status: status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

/**
 * Creates a success response with CORS headers
 * @param message Success message
 * @param data Additional response data
 * @param requestId Unique request identifier
 * @returns Response object with success details
 */
export function createSuccessResponse(
  message: string,
  data: Record<string, unknown>,
  requestId: string
): Response {
  return new Response(JSON.stringify({ 
    success: true, 
    message: message,
    ...data,
    requestId: requestId
  }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
