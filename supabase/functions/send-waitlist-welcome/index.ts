// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Set the API key for Brevo
const BREVO_API_KEY = "your_brevo_api_key_here";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL');
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    console.log("Received request");

    // Parse the request content type
    const contentType = req.headers.get("Content-Type");
    console.log("Content-Type:", contentType);

    // Parse the request body
    const body = await req.json();
    const { email, firstName, teachingLevel } = body;

    console.log("Processing welcome email for:", { email, firstName, teachingLevel });

    // Ensure the API key is set
    if (!BREVO_API_KEY) {
      throw new Error("Missing BREVO_API_KEY");
    }

    console.log("Sending email...");

    // Send the email using Brevo API
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          "name": "pedagoia",
          "email": BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: email,
            name: firstName,
          },
        ],
        subject: "Bienvenue sur la liste d'attente de PedagoIA !",
        htmlContent: `
          <h1>Bonjour ${firstName} !</h1>
          <p>Merci de votre intérêt pour PedagoIA. Nous sommes ravis de vous compter parmi nos futurs utilisateurs.</p>
          <p>Nous avons bien noté que vous enseignez au niveau : ${teachingLevel}</p>
          <p>Nous travaillons actuellement sur le développement de notre plateforme et nous vous tiendrons informé(e) de son lancement.</p>
          <p>À très bientôt !</p>
          <p>L'équipe PedagoIA</p>
        `,
      }),
    });

    // Check if the email was sent successfully
    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    // Return a success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-waitlist-welcome function:", error);

    // Return an error response
    return new Response(
        JSON.stringify({
          error: error.message,
          details: "Failed to process waitlist welcome email",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
    );
  }
});