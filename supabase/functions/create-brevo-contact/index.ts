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
        console.log("Creating Brevo contact for", firstName || "Anonymous", email);
        
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
                    PRENOM: firstName || "Anonymous", // Optional: First name
                },
                updateEnabled: false, // Do not update existing contacts
            }),
        });
        
        const responseText = await response.text();
        let responseDetail;
        
        try {
            // Try to parse as JSON if possible
            responseDetail = JSON.parse(responseText);
        } catch {
            // Otherwise keep as text
            responseDetail = responseText;
        }
        
        // Handle Brevo API response
        if (!response.ok) {
            // If the error is because the contact already exists (duplicate), don't treat as error
            if (response.status === 400 && responseText.includes("Contact already exist")) {
                return new Response(JSON.stringify({ 
                    message: "Contact already exists in Brevo, no update needed",
                    details: responseDetail
                }), {
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                });
            }
            
            const msg = JSON.stringify({ error: "Failed to create Brevo contact", details: responseDetail });
            console.log(msg);
            return new Response(msg, {
                status: response.status,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Success response
        const msg = JSON.stringify({ 
            message: `Brevo contact created for ${email}`, 
            details: responseDetail 
        });
        console.log(msg);
        return new Response(msg, {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        // Handle errors
        const msg = JSON.stringify({ 
            error: "Internal Server Error", 
            details: error.message,
            stack: error.stack
        });
        console.log(msg);
        return new Response(msg, {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
