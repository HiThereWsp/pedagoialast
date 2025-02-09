import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts'




const BREVO_TEMPLATE_ID = "your-template-id"; // Optional, if using templates

console.log("Hello from Functions!");

Deno.serve(async (req) => {
    const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL');
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { type, email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(
          {
            sender: {
              "name": "pedagoia",
              "email": BREVO_SENDER_EMAIL
            },
            to: [
              {
                "email": email,
                "name": "Welcome to the pedagoia"
              }
            ],
            subject: "Welcome to the pedagoia",
            htmlContent: "<html><head></head><body><p>Hello,</p>Welcome to the pedagoia your email is verified.</p></body></html>"
          }),
    });

    if (!response.ok) {
      return new Response(
          JSON.stringify({ error: "Failed to send email :(", details: await response.text() }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
      );
    }

    return new Response(
        JSON.stringify({ message: `Welcome email sent to ${email}` }),
        { headers: { "Content-Type": "application/json" }, ...corsHeaders }
    );
  } catch (error) {
    return new Response(
        JSON.stringify({ error: "Internal Server Error", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" }, ...corsHeaders }
    );
  }
});

