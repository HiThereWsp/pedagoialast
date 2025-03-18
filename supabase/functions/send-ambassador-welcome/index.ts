
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const BREVO_AMBASSADOR_LIST_ID = 7; // Assuming ambassador list ID is 7 (same as BETA_USERS in create-brevo-contact)

const getAmbassadorWelcomeTemplate = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenue dans le programme Ambassadeur PedagoIA</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 0.875rem;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue dans le programme Ambassadeur PedagoIA !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${firstName} !</p>
      <p>Merci de faire partie de nos ambassadeurs. Ton inscription est confirmée !</p>
      <p>Tu peux dès maintenant te connecter et utiliser toutes les fonctionnalités de PedagoIA avec ton compte ambassadeur.</p>
      <p>N'hésite pas à explorer toutes les fonctionnalités disponibles et à nous faire part de tes retours !</p>
      <a href="https://app.pedagoia.fr/login" class="button">Accéder à PedagoIA</a>
    </div>
    <div class="footer">
      <p>© 2024 PedagoIA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`

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
    if (!BREVO_API_KEY) {
      console.error(`[${requestId}] ❌ BREVO_API_KEY is missing`);
      return new Response(JSON.stringify({ error: "API key configuration missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      console.log(`[${requestId}] ❌ Method not allowed: ${req.method}`);
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse the request body
    const { email, firstName, userId, manualSend = false } = await req.json();
    
    if (!email) {
      console.log(`[${requestId}] ❌ Email is required but was missing`);
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log(`[${requestId}] 📧 Processing ambassador welcome email request for: ${email}, name: ${firstName || 'Ambassadeur'}, userId: ${userId || 'unknown'}`);
    console.log(`[${requestId}] Manual send mode: ${manualSend ? 'YES' : 'NO'}`);
    
    // Check if welcome email was already sent (unless this is a manual send)
    if (!manualSend) {
      console.log(`[${requestId}] 🔍 Checking if welcome email was already sent to ${email}`);
      try {
        const checkStartTime = Date.now();
        const checkResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "api-key": BREVO_API_KEY,
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
            return new Response(JSON.stringify({ 
              message: "Welcome email already sent to this user", 
              skipped: true,
              requestId: requestId
            }), {
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          } else {
            console.log(`[${requestId}] ✅ Welcome email not sent yet to ${email}, proceeding.`);
          }
        } else {
          // If contact doesn't exist or there's an error, we'll proceed with sending
          const errorText = await checkResponse.text();
          console.log(`[${requestId}] Could not check contact status (${checkResponse.status}): ${errorText}. Will send email anyway.`);
        }
      } catch (e) {
        // If we can't check, we'll proceed with sending anyway
        console.error(`[${requestId}] ❌ Error checking contact attributes:`, e);
        console.log(`[${requestId}] Will proceed with sending email despite check error`);
      }
    } else {
      console.log(`[${requestId}] 🔄 Manual send mode - skipping previous send check`);
    }
    
    // Send email via Brevo transactional email API
    console.log(`[${requestId}] 📤 Attempting to send welcome email to ${email}`);
    const sendStartTime = Date.now();
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
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
        htmlContent: getAmbassadorWelcomeTemplate(firstName || "Ambassadeur"),
        replyTo: {
          email: "contact@pedagoia.fr",
          name: "Support PedagoIA"
        }
      }),
    });

    console.log(`[${requestId}] Brevo email API response status: ${response.status} (took ${Date.now() - sendStartTime}ms)`);

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error(`[${requestId}] ❌ Brevo API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorDetail
      });
      
      return new Response(JSON.stringify({ 
        error: "Failed to send welcome email", 
        details: errorDetail,
        status: response.status,
        requestId: requestId
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mark the contact as having received the welcome email
    console.log(`[${requestId}] 📝 Updating contact attributes in Brevo to mark welcome email as sent`);
    try {
      const updateStartTime = Date.now();
      const updateResponse = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
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
    } catch (e) {
      console.error(`[${requestId}] ❌ Exception updating contact attributes:`, e);
      // Continue even if this fails
    }

    // Success response
    console.log(`[${requestId}] ✅ Ambassador welcome email successfully sent to ${email}`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Ambassador welcome email sent to ${email}`,
      requestId: requestId
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ Internal server error:`, error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message,
      requestId: requestId
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
