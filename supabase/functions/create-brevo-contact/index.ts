import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Only allow POST requests
        if (req.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Parse the request body
        const { email, firstName } = await req.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }
        console.log("Creating Bevo for", firstName, email);
        // Create Brevo contact
        const response = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                email: email,
                attributes: {
                    PRENOM: firstName || "Unknown", // Optional: First name
                },
                updateEnabled: false, // Do not update existing contacts
            }),
        });
        const response_detail = await response.text()
        // Handle Brevo API response
        if (!response.ok) {
            const msg = JSON.stringify({ error: "Failed to create Brevo contact", details: response_detail });
            console.log(msg);
            return new Response(msg, {
                status: response.status,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Success response
        const msg = JSON.stringify({ message: `Brevo contact created for ${email}, response: ${response_detail}` });
        console.log(msg);
        return new Response(msg, {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        // Handle errors
        const msg = JSON.stringify({ error: "Internal Server Error", details: error.message });
        console.log(msg);
        return new Response(msg, {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});