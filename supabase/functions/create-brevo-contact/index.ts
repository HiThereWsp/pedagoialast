
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Les ID des listes Brevo (à remplacer par les vrais ID)
const BREVO_LISTS = {
  BETA_USERS: 7,      // Liste existante des utilisateurs beta
  FREE_USERS: 8,      // Nouvelle liste pour les utilisateurs inscrits non payants
  PREMIUM_USERS: 9    // Nouvelle liste pour les utilisateurs payants
};

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
        const { 
            email, 
            contactName, 
            etablissement, 
            taille, 
            phone, 
            source = "signup",
            userType = "free" // Peut être 'free', 'premium', 'beta', ou 'school'
        } = await req.json();
        
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }
        
        console.log(`Creating/updating Brevo contact for: ${contactName}, ${email}, type: ${userType}, from ${source}`);
        
        // Déterminer les listes appropriées en fonction du type d'utilisateur
        let listIds = [];
        
        switch(userType) {
            case 'beta':
                listIds = [BREVO_LISTS.BETA_USERS];
                break;
            case 'premium':
                listIds = [BREVO_LISTS.PREMIUM_USERS];
                break;
            case 'school':
                // Pour les établissements scolaires, on peut les mettre dans une liste spécifique
                // ou avec les utilisateurs premium selon les besoins
                listIds = [BREVO_LISTS.PREMIUM_USERS];
                break;
            case 'free':
            default:
                listIds = [BREVO_LISTS.FREE_USERS];
                break;
        }
        
        // Create payload with attributes based on source
        let attributes = {};
        
        if (source === "pricing_form") {
            // Pour les formulaires de demande d'établissement scolaire
            attributes = {
                CONTACT: contactName || "Direction",
                EMAIL: email,
                PHONE: phone || "Non spécifié",
                TYPE_ETABLISSEMENT: etablissement || "Non spécifié",
                TAILLE: taille || "Non spécifiée",
                TYPE_DEMANDE: "Établissement scolaire",
                TYPE_UTILISATEUR: "school"
            };
        } else {
            // Pour les inscriptions régulières
            attributes = {
                PRENOM: contactName || "Utilisateur",
                EMAIL: email,
                SOURCE: "Inscription site web",
                TYPE_UTILISATEUR: userType // Stocker le type d'utilisateur dans Brevo
            };
        }
        
        // Create/Update Brevo contact
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
                listIds: listIds, // Attribuer les bonnes listes
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
                error: "Failed to create/update Brevo contact", 
                details: responseDetails,
                status: response.status
            }), {
                status: response.status,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // Success response
        console.log("Contact successfully created/updated in Brevo:", responseDetails);
        return new Response(JSON.stringify({ 
            message: `Brevo contact created/updated for ${email}`,
            details: {
                email: email,
                userType: userType,
                lists: listIds
            }
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
