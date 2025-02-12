
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

        // Créer le payload pour Brevo avec les attributs exacts
        const payload = {
            email,
            attributes: {
                PRENOM_NOM: contactName,
                TELEPHONE: phone,
                TYPE_ETABLISSEMENT: etablissement,
                NOMBRE_ENSEIGNANTS: taille
            },
            listIds: [7],
            updateEnabled: true
        }
        
        console.log("Sending to Brevo:", payload)

        // Créer ou mettre à jour le contact dans Brevo et l'ajouter à la liste 7
        const createContactResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify(payload)
        });

        if (!createContactResponse.ok) {
            const errorText = await createContactResponse.text()
            console.error("Failed to create contact in Brevo:", errorText)
            throw new Error(`Failed to create contact: ${errorText}`)
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
