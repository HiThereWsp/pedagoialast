
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { 
  checkPreviousWelcomeEmail, 
  sendBrevoEmail, 
  updateContactAttributes,
  createErrorResponse,
  createSuccessResponse
} from './brevo-api.ts';
import { getAmbassadorWelcomeTemplate } from './template.ts';

serve(async (req) => {
  // Generate request ID for tracing this specific request through logs
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  console.log(`[${requestId}] 🚀 Ambassador welcome email request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    
    if (!BREVO_API_KEY) {
      console.error(`[${requestId}] ❌ BREVO_API_KEY is missing`);
      return createErrorResponse(
        "API key configuration missing", 
        500, 
        "BREVO_API_KEY environment variable is not set", 
        requestId
      );
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      console.log(`[${requestId}] ❌ Method not allowed: ${req.method}`);
      return createErrorResponse(
        "Method not allowed", 
        405, 
        `Method ${req.method} is not supported, only POST is allowed`, 
        requestId
      );
    }

    // Parse the request body
    const { email, firstName, userId, manualSend = false } = await req.json();
    
    if (!email) {
      console.log(`[${requestId}] ❌ Email is required but was missing`);
      return createErrorResponse(
        "Email is required", 
        400, 
        "The email parameter is missing from the request body", 
        requestId
      );
    }
    
    console.log(`[${requestId}] 📧 Processing ambassador welcome email request for: ${email}, name: ${firstName || 'Ambassadeur'}, userId: ${userId || 'unknown'}`);
    console.log(`[${requestId}] Manual send mode: ${manualSend ? 'YES' : 'NO'}`);
    
    // Check if welcome email was already sent (unless this is a manual send)
    if (!manualSend) {
      const emailAlreadySent = await checkPreviousWelcomeEmail(
        email,
        BREVO_API_KEY,
        requestId
      );
      
      if (emailAlreadySent) {
        return createSuccessResponse(
          "Welcome email already sent to this user", 
          { skipped: true }, 
          requestId
        );
      }
    } else {
      console.log(`[${requestId}] 🔄 Manual send mode - skipping previous send check`);
    }
    
    // Generate email template
    const emailTemplate = getAmbassadorWelcomeTemplate(firstName || "Ambassadeur");
    
    // Send email via Brevo transactional email API
    const response = await sendBrevoEmail(
      email,
      firstName || "Ambassadeur PedagoIA",
      emailTemplate,
      BREVO_API_KEY,
      requestId
    );

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error(`[${requestId}] ❌ Brevo API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorDetail
      });
      
      return createErrorResponse(
        "Failed to send welcome email", 
        response.status, 
        errorDetail, 
        requestId
      );
    }

    // Mark the contact as having received the welcome email
    await updateContactAttributes(email, BREVO_API_KEY, requestId);

    // Success response
    console.log(`[${requestId}] ✅ Ambassador welcome email successfully sent to ${email}`);
    return createSuccessResponse(
      `Ambassador welcome email sent to ${email}`,
      {},
      requestId
    );
  } catch (error) {
    console.error(`[${requestId}] ❌ Internal server error:`, error.message, error.stack);
    return createErrorResponse(
      "Internal Server Error", 
      500, 
      error.message, 
      requestId
    );
  }
});
