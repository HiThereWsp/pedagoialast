
import { corsHeaders } from '../_shared/cors.ts'

const BREVO_TEMPLATE_ID = 7;

console.log("Hello from Functions!")

Deno.serve(async (req) => {
    const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL')
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    try {
        const { contactName, email, etablissement, taille, phone } = await req.json()

        // Créer le contact dans Brevo et l'ajouter à la liste 7
        const createContactResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                email,
                attributes: {
                    NOM: contactName,
                    PHONE: phone,
                    ETABLISSEMENT: etablissement,
                    TAILLE: taille
                },
                listIds: [7],
                updateEnabled: true
            })
        });

        if (!createContactResponse.ok) {
            throw new Error(`Failed to create contact: ${await createContactResponse.text()}`)
        }

        return new Response(
            JSON.stringify({ message: "Contact créé et ajouté à la liste avec succès" }),
            { 
                headers: { 
                    "Content-Type": "application/json",
                    ...corsHeaders 
                } 
            }
        );

    } catch (error) {
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
