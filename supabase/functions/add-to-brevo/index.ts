
import { corsHeaders } from '../_shared/cors.ts'

console.log("Starting add-to-brevo function")

Deno.serve(async (req) => {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    try {
        const { contactName, email, etablissement, taille, phone } = await req.json()
        console.log("Received contact data:", { contactName, email, etablissement, taille, phone })

        // Créer ou mettre à jour le contact dans Brevo et l'ajouter à la liste 7
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
            const errorText = await createContactResponse.text()
            console.error("Failed to create contact in Brevo:", errorText)
            throw new Error(`Failed to create contact: ${errorText}`)
        }

        console.log("Contact successfully created/updated in Brevo")
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
