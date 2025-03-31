import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Brevo configuration
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@yourdomain.com';
const BREVO_SENDER_NAME = 'Pedagoia';

console.log("Initializing email function");

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { type, email } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Email is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Preparing to send email to ${email}`);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: BREVO_SENDER_NAME,
                    email: BREVO_SENDER_EMAIL
                },
                to: [{
                    email,
                    name: 'Pedagoia User'
                }],
                subject: 'Bienvenue sur Pedagoia',
                htmlContent: `
          <html>
            <head></head>
            <body>
              <h1>Bienvenue sur Pedagoia!</h1>
              <p>Votre email est vérifié. Profitez de votre expérience avec Pedagoia.</p>
            </body>
          </html>
        `
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Failed to send email to ${email}: ${errorDetails}`);
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: errorDetails }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Successfully sent welcome email to ${email}`);
        return new Response(
            JSON.stringify({ message: `Welcome email sent to ${email}` }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error(`Internal error while processing email: ${error.message}`);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});