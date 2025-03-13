import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Starting add-to-brevo function (DEPRECATED)")

serve(async (req) => {
    // This function is now deprecated in favor of create-brevo-contact
    // We're keeping it for backward compatibility, but redirecting to the new function
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    try {
        const { contactName, email, etablissement, taille, phone } = await req.json()
        console.log("Received contact data (DEPRECATED function):", { contactName, email, etablissement, taille, phone })
        console.log("Redirecting to create-brevo-contact function")

        // Call the new function instead
        const response = await fetch(`${req.url.replace('add-to-brevo', 'create-brevo-contact')}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": req.headers.get("Authorization") || "",
            },
            body: JSON.stringify({
                email,
                contactName,
                etablissement,
                taille,
                phone,
                source: "pricing_form"
            })
        });

        // Return the response from the new function
        const responseData = await response.json();
        return new Response(
            JSON.stringify(responseData),
            { 
                status: response.status,
                headers: { 
                    "Content-Type": "application/json",
                    ...corsHeaders 
                } 
            }
        );

    } catch (error) {
        console.error("Error in add-to-brevo function:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { 
                status: 500, 
                headers: { 
                    "Content-Type": "application/json",
                    ...corsHeaders 
                } 
            }
        );
    }
});
