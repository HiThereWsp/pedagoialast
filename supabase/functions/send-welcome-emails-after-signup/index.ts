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
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const { type, email } = await req.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }
        console.log("Sending email to", email)
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
                            "name": "Bienvenue sur Pedagoia"
                        }
                    ],
                    subject: "Bienvenue sur Pedagoia",
                    htmlContent: "<html><head></head><body>Bienvenue sur Pedagoia, votre email est vérifié.</p></body></html>\n"
                }),
        });

        if (!response.ok) {
            const msg = JSON.stringify({ error: "Failed to send email :(", details: await response.text() })
            console.log(msg)
            return new Response(
                msg,
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }
        const msg = JSON.stringify({ message: `Welcome email sent to ${email}` })
        console.log(msg)
        return new Response(
            msg,
            { headers: { "Content-Type": "application/json" }, ...corsHeaders }
        );
    } catch (error) {
        const msg = JSON.stringify({ error: "Internal Server Error", details: error.message })
        console.log(msg)
        return new Response(
            msg,
            { status: 500, headers: { "Content-Type": "application/json" }, ...corsHeaders }
        );
    }
});