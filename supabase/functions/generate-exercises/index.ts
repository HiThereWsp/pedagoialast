
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerationParams {
  subject: string;
  classLevel: string;
  numberOfExercises: number;
  questionsPerExercise: number;
  objective: string;
  exerciseType?: string;
  additionalInstructions?: string;
  specificNeeds?: string;
  originalExercise?: string;
  studentProfile?: string;
  learningDifficulties?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
  if (!MISTRAL_API_KEY) {
    throw new Error('Clé API Mistral non configurée');
  }

  try {
    const params = await req.json();
    console.log('🔵 Début de la génération:', {
      subject: params.subject,
      classLevel: params.classLevel,
      numberOfExercises: params.numberOfExercises,
      timestamp: new Date().toISOString()
    });

    // Validation des paramètres requis
    if (!params.subject || !params.classLevel || !params.objective) {
      throw new Error('Paramètres requis manquants');
    }

    const systemPrompt = `Tu es un assistant pédagogique expert qui crée des exercices adaptés au système éducatif français.
Tu dois générer trois fiches distinctes et très détaillées :

1. FICHE ÉLÈVE avec :
- Titre clair
- Objectifs d'apprentissage
- Consignes précises
- Exercices numérotés
- Espace pour les réponses

2. FICHE CORRECTION avec :
- Solutions détaillées
- Explications pas à pas
- Points clés à retenir

3. FICHE PÉDAGOGIQUE avec :
- Objectifs pédagogiques
- Prérequis
- Points d'attention
- Différenciation possible
- Critères d'évaluation
- Prolongements

Format OBLIGATOIRE avec les séparateurs :
FICHE ÉLÈVE
[contenu]
FICHE CORRECTION
[contenu]
FICHE PÉDAGOGIQUE
[contenu]`;

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
          { role: 'user', content: `Crée ${params.numberOfExercises} exercices de ${params.subject} pour une classe de ${params.classLevel}.
Objectif pédagogique : ${params.objective}
${params.exerciseType ? `Type d'exercice souhaité : ${params.exerciseType}` : ''}
${params.additionalInstructions ? `Instructions spécifiques : ${params.additionalInstructions}` : ''}
${params.specificNeeds ? `Besoins spécifiques : ${params.specificNeeds}` : ''}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur Mistral AI:', error);
      throw new Error(`Erreur API Mistral: ${response.status}`);
    }

    const data = await response.json();
    const exercises = data.choices[0].message.content;

    // Vérifions que les trois sections sont présentes
    const sections = ['FICHE ÉLÈVE', 'FICHE CORRECTION', 'FICHE PÉDAGOGIQUE'];
    const missingSections = sections.filter(section => !exercises.includes(section));
    
    if (missingSections.length > 0) {
      console.error('❌ Sections manquantes:', missingSections);
      throw new Error(`Génération incomplète : ${missingSections.join(', ')} manquante(s)`);
    }

    console.log('✅ Exercices générés avec succès');
    
    return new Response(
      JSON.stringify({ exercises }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la génération des exercices', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
