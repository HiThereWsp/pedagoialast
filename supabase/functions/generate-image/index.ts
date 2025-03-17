
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

    // La clé API de Replicate
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('La clé API Replicate n\'est pas configurée');
    }

    // Créer un client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Détecter le style d'image demandé
    const imageStyle = requestData.style || 'auto';

    // Construire le prompt pour Replicate basé sur le style demandé
    let fullPrompt = requestData.prompt;
    let model = "stability-ai/stable-diffusion-xl-base-1.0";
    let additionalParams = {};

    console.log('Génération d\'image avec style:', imageStyle);

    // Modification du modèle et des params selon le style
    switch (imageStyle) {
      case 'realistic':
        fullPrompt = `high quality, photorealistic, detailed, ${requestData.prompt}`;
        break;
      case 'cartoon':
        fullPrompt = `cartoon style, colorful, fun, ${requestData.prompt}`;
        model = "stability-ai/sdxl"; // Autre modèle pour style cartoon
        additionalParams = {
          refine: "expert_ensemble_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6
        };
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
      // cas par défaut - on utilise le prompt tel quel avec le modèle standard
    }
    
    // Configuration standard des paramètres pour Replicate
    const replicateParams = {
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: fullPrompt,
        negative_prompt: "poorly drawn, bad anatomy, distorted, blurry, low quality",
        width: 1024,
        height: 1024,
        num_outputs: 1,
        num_inference_steps: 25,
        ...additionalParams
      }
    };

    console.log('Appel de Replicate avec params:', replicateParams);

    // Appel à l'API Replicate
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(replicateParams)
    });

    if (!replicateResponse.ok) {
      const errorDetails = await replicateResponse.text();
      console.error('Erreur Replicate:', errorDetails);
      throw new Error(`Erreur Replicate: ${replicateResponse.status} ${replicateResponse.statusText}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prédiction initiée:', prediction);

    // Si aucun ID de prédiction n'est retourné
    if (!prediction.id) {
      throw new Error('ID de prédiction manquant dans la réponse Replicate');
    }

    // Vérifier le statut de la prédiction jusqu'à ce qu'elle soit terminée
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // Limite à 60 secondes (30 * 2s)

    while (attempts < maxAttempts) {
      // Attendre 2 secondes entre chaque vérification
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      // Vérifier le statut
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${replicateApiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!statusResponse.ok) {
        console.error('Erreur lors de la vérification du statut:', statusResponse.status);
        continue;
      }

      const status = await statusResponse.json();
      console.log(`Statut (tentative ${attempts}/${maxAttempts}):`, status.status);

      // Si la prédiction est terminée
      if (status.status === 'succeeded') {
        imageUrl = status.output?.[0];
        break;
      } else if (status.status === 'failed') {
        throw new Error('La génération d\'image a échoué: ' + (status.error || 'Raison inconnue'));
      }

      // Si on atteint le nombre maximal de tentatives
      if (attempts >= maxAttempts) {
        throw new Error('Délai d\'attente dépassé pour la génération d\'image');
      }
    }

    // Vérifier si on a bien récupéré une URL d'image
    if (!imageUrl) {
      throw new Error('Aucune URL d\'image générée');
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
