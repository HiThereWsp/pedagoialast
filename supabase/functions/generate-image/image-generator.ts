
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export interface GenerationParams {
  prompt: string;
  style?: string;
  userId?: string;
}

export interface GenerationResult {
  url: string;
}

export async function generateImage(params: GenerationParams): Promise<GenerationResult> {
  const { prompt, style = 'auto', userId } = params;
  
  // La clé API de OpenAI
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('La clé API OpenAI n\'est pas configurée');
  }

  // Créer un client Supabase si nécessaire pour l'enregistrement
  const supabaseAdmin = userId ? createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  ) : null;

  // Détecter le style d'image demandé
  const imageStyle = style || 'auto';

  // Construire le prompt pour DALL-E basé sur le style demandé
  let fullPrompt = prompt;
  let imageSize = "1024x1024";

  console.log('Génération d\'image avec style:', imageStyle);

  // Modification du prompt selon le style
  switch (imageStyle) {
    case 'realistic':
      fullPrompt = `high quality, photorealistic, detailed, ${prompt}`;
      break;
    case 'cartoon':
      fullPrompt = `cartoon style, colorful, fun, ${prompt}`;
      break;
    case 'watercolor':
      fullPrompt = `watercolor painting style, artistic, soft colors, ${prompt}`;
      break;
    case 'sketch':
      fullPrompt = `detailed pencil sketch, black and white, hand-drawn look, ${prompt}`;
      break;
    case 'minimalist':
      fullPrompt = `minimalist design, clean lines, simple, elegant, ${prompt}`;
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
  if (userId && supabaseAdmin) {
    try {
      const { error: dbError } = await supabaseAdmin
        .from('image_generation_usage')
        .insert({
          user_id: userId,
          prompt: prompt,
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

  return { url: imageUrl };
}
