
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    
    if (!BREVO_API_KEY) {
        console.error("BREVO_API_KEY is missing");
        return new Response(JSON.stringify({ error: "API key configuration missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

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
        const { email, contactName, etablissement, taille, phone } = await req.json();
        
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }
        
        console.log(`Creating Brevo contact for school: ${contactName}, ${email}, ${etablissement}, ${taille}`);
        
        // Create attributes for school pricing form submissions
        const attributes = {
            CONTACT: contactName || "Direction",
            EMAIL: email,
            PHONE: phone || "Non spécifié",
            TYPE_ETABLISSEMENT: etablissement || "Non spécifié",
            TAILLE: taille || "Non spécifiée",
            TYPE_DEMANDE: "Établissement scolaire"
        };
        
        // Create Brevo contact
        const response = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                email: email,
                attributes: attributes,
                updateEnabled: true, // Update existing contacts
                listIds: [7], // List #7 only
            }),
        });

        // Get response details for debugging
        let responseDetails;
        try {
            responseDetails = await response.json();
        } catch (e) {
            responseDetails = await response.text();
        }

        // Handle Brevo API response
        if (!response.ok) {
            console.error("Brevo API error:", responseDetails);
            return new Response(JSON.stringify({ 
                error: "Failed to create Brevo contact", 
                details: responseDetails,
                status: response.status
            }), {
                status: response.status,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Success response
        console.log("School contact successfully created in Brevo:", responseDetails);
        return new Response(JSON.stringify({ 
            message: `Brevo contact created for ${email}`,
            details: responseDetails
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        // Handle errors
        console.error("Internal error:", error.message);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
