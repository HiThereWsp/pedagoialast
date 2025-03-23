
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateImage } from "./image-generator.ts";
import { logErrorToDatabase } from "./error-handler.ts";

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // S'assurer que la méthode est POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Récupérer le corps de la requête
    const requestData = await req.json();
    
    // Validation des données
    if (!requestData.prompt) {
      throw new Error('Le prompt est requis');
    }

    console.log('Requête reçue avec prompt:', requestData.prompt);

    // Génération de l'image
    const imageResult = await generateImage({
      prompt: requestData.prompt,
      style: requestData.style,
      userId: requestData.userId
    });

    // Retourner l'URL de l'image générée
    return new Response(
      JSON.stringify({ url: imageResult.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur durant la génération d\'image:', error);
    
    // Enregistrer l'erreur dans la base de données si un ID utilisateur est fourni
    try {
      const requestData = await req.json().catch(() => ({}));
      await logErrorToDatabase(requestData.userId, requestData.prompt, error.message);
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement de l\'erreur:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Une erreur est survenue lors de la génération de l\'image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
