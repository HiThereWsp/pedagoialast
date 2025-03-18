
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is missing");
      return new Response(JSON.stringify({ error: "API key configuration missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse the request body
    const { email, firstName, userId, manualSend = false } = await req.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log(`Sending ambassador welcome email to: ${email}, name: ${firstName || 'Ambassadeur'}`);
    
    // Check if welcome email was already sent (unless this is a manual send)
    if (!manualSend) {
      // Use Brevo API to check if the user already has the WELCOME_EMAIL_SENT attribute
      try {
        const checkResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "api-key": BREVO_API_KEY,
          }
        });
        
        if (checkResponse.ok) {
          const contactData = await checkResponse.json();
          if (contactData.attributes && contactData.attributes.WELCOME_EMAIL_SENT === "true") {
            console.log(`Welcome email already sent to ${email}, skipping.`);
            return new Response(JSON.stringify({ 
              message: "Welcome email already sent to this user", 
              skipped: true 
            }), {
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
        }
      } catch (e) {
        // If we can't check, we'll proceed with sending anyway
        console.error("Error checking contact attributes:", e);
      }
    }
    
    // Send email via Brevo transactional email API
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

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Brevo API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorDetail
      });
      
      return new Response(JSON.stringify({ 
        error: "Failed to send welcome email", 
        details: errorDetail,
        status: response.status
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mark the contact as having received the welcome email
    try {
      await fetch("https://api.brevo.com/v3/contacts", {
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
      console.log(`Contact ${email} updated with WELCOME_EMAIL_SENT=true`);
    } catch (e) {
      console.error("Error updating contact attributes:", e);
      // Continue even if this fails
    }

    // Success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Ambassador welcome email sent to ${email}` 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Internal server error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
