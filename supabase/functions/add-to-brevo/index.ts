
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Starting add-to-brevo function")

serve(async (req) => {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    try {
        const { contactName, email, etablissement, taille, phone } = await req.json()
        console.log("Received contact data:", { contactName, email, etablissement, taille, phone })

        // Créer le payload pour Brevo avec les attributs exacts comme spécifiés
        const payload = {
            email,
            attributes: {
                CONTACT: contactName,
                EMAIL: email,
                PHONE: phone,
                TYPE_ETABLISSEMENT: etablissement,
                TAILLE: taille
            },
            listIds: [7],
            updateEnabled: true
        }
        
        console.log("Sending to Brevo:", payload)

        // D'abord, vérifions si le contact existe déjà
        const getContactResponse = await fetch(`https://api.brevo.com/v3/contacts/${email}`, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
            }
        });

        let createContactResponse;
        
        if (getContactResponse.status === 200) {
            // Le contact existe, on met à jour
            console.log("Contact exists, updating...")
            createContactResponse = await fetch("https://api.brevo.com/v3/contacts", {
                method: "PUT",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": BREVO_API_KEY,
                },
                body: JSON.stringify(payload)
            });
        } else {
            // Nouveau contact, on crée
            console.log("Creating new contact...")
            createContactResponse = await fetch("https://api.brevo.com/v3/contacts", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": BREVO_API_KEY,
                },
                body: JSON.stringify(payload)
            });
        }

        if (!createContactResponse.ok) {
            const errorText = await createContactResponse.text()
            console.error("Failed to create/update contact in Brevo:", errorText)
            throw new Error(`Failed to create/update contact: ${errorText}`)
        }

        const responseData = await createContactResponse.json()
        console.log("Brevo API response:", responseData)

        return new Response(
            JSON.stringify({ message: "Contact ajouté à la liste avec succès" }),
            { 
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
