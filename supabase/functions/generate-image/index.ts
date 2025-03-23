
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // La clé API de OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    // Créer un client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Détecter le style d'image demandé
    const imageStyle = requestData.style || 'auto';

    // Construire le prompt pour DALL-E basé sur le style demandé
    let fullPrompt = requestData.prompt;
    let imageSize = "1024x1024";

    console.log('Génération d\'image avec style:', imageStyle);

    // Modification du prompt selon le style
    switch (imageStyle) {
      case 'realistic':
        fullPrompt = `high quality, photorealistic, detailed, ${requestData.prompt}`;
        break;
      case 'cartoon':
        fullPrompt = `cartoon style, colorful, fun, ${requestData.prompt}`;
        break;
      case 'watercolor':
        fullPrompt = `watercolor painting style, artistic, soft colors, ${requestData.prompt}`;
        break;
      case 'sketch':
        fullPrompt = `detailed pencil sketch, black and white, hand-drawn look, ${requestData.prompt}`;
        break;
      case 'minimalist':
        fullPrompt = `minimalist design, clean lines, simple, elegant, ${requestData.prompt}`;
        break;
      // cas par défaut - on utilise le prompt tel quel
    }
    
    console.log('Appel de OpenAI DALL-E avec prompt:', fullPrompt);

    // Appel à l'API OpenAI pour DALL-E 3
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: imageSize,
        quality: "standard",
        response_format: "url"
      })
    });

    if (!openaiResponse.ok) {
      const errorDetails = await openaiResponse.text();
      console.error('Erreur OpenAI:', errorDetails);
      throw new Error(`Erreur OpenAI: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('Réponse OpenAI reçue:', openaiData);

    // Extraire l'URL de l'image générée
    const imageUrl = openaiData.data[0]?.url;

    // Si aucune URL d'image n'est retournée
    if (!imageUrl) {
      throw new Error('URL d\'image manquante dans la réponse OpenAI');
    }

    console.log('Image générée avec succès:', imageUrl);

    // Enregistrer l'usage dans la base de données si un ID utilisateur est fourni
    if (requestData.userId) {
      try {
        const { error: dbError } = await supabaseAdmin
          .from('image_generation_usage')
          .insert({
            user_id: requestData.userId,
            prompt: requestData.prompt,
            status: 'success',
            image_url: imageUrl
          });

        if (dbError) {
          console.error('Erreur lors de l\'enregistrement dans la base de données:', dbError);
        }
      } catch (dbError) {
        console.error('Exception lors de l\'enregistrement dans la base de données:', dbError);
      }
    }

    // Retourner l'URL de l'image générée
    return new Response(
      JSON.stringify({ url: imageUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur durant la génération d\'image:', error);
    
    // Enregistrer l'erreur dans la base de données si un ID utilisateur est fourni
    try {
      const requestData = await req.json().catch(() => ({}));
      
      if (requestData.userId) {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseAdmin
          .from('image_generation_usage')
          .insert({
            user_id: requestData.userId,
            prompt: requestData.prompt || 'Prompt inconnu',
            status: 'error',
            error_message: error.message
          });
      }
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement de l\'erreur:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Une erreur est survenue lors de la génération de l\'image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
