
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
  if (!MISTRAL_API_KEY) {
    throw new Error('Clé API Mistral non configurée');
  }

  try {
    const params = await req.json();
    console.log('📝 Paramètres reçus:', JSON.stringify(params, null, 2));

    const systemPrompt = `Tu es un assistant pédagogique expert qui crée des exercices adaptés au système éducatif français.
Tu dois générer deux fiches distinctes avec EXACTEMENT ces titres et dans cet ordre :

"FICHE ÉLÈVE"
- Titre de la séquence
- Objectifs d'apprentissage
- Consignes claires
- Exercices numérotés
- Espace pour les réponses

"FICHE CORRECTION"
- Toutes les réponses détaillées
- Explications pédagogiques
- Points clés à retenir

Format REQUIS :
FICHE ÉLÈVE
[contenu]
FICHE CORRECTION
[contenu]`;

    const userPrompt = `Crée un ensemble complet d'exercices de ${params.subject} pour une classe de ${params.classLevel}.
Objectif principal : ${params.objective}
${params.exerciseType ? `Type d'exercices souhaité : ${params.exerciseType}` : ''}
${params.specificNeeds ? `Besoins spécifiques : ${params.specificNeeds}` : ''}
${params.additionalInstructions ? `Instructions supplémentaires : ${params.additionalInstructions}` : ''}`;

    console.log('📤 Envoi du prompt à Mistral AI');

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur de l\'API Mistral:', error);
      throw new Error(`Erreur API Mistral: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Vérification de la présence des deux sections
    const sections = ['FICHE ÉLÈVE', 'FICHE CORRECTION'];
    for (const section of sections) {
      if (!result.includes(section)) {
        console.error(`❌ Section manquante: ${section}`);
        throw new Error(`La section "${section}" est manquante dans la génération`);
      }
    }

    console.log('✅ Génération réussie avec les deux sections');
    
    return new Response(
      JSON.stringify({ exercises: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
