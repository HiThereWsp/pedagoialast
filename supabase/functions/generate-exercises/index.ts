
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIMEOUT_MS = 25000; // 25 secondes de timeout

serve(async (req) => {
  const startTime = performance.now();
  console.log("🔵 Début de la génération d'exercices");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Créer un contrôleur de timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const requestData = await req.json();
    const { 
      subject, 
      classLevel, 
      objective,
      numberOfExercises = 4,
      questionsPerExercise = 5,
      exerciseType = '',
      additionalInstructions = '',
      specificNeeds = '',
      challenges = '',
    } = requestData;

    console.log("📝 Paramètres reçus:", { 
      subject, classLevel, objective,
      numberOfExercises, questionsPerExercise,
      exerciseType, specificNeeds 
    });

    const systemPrompt = `Tu es un expert en pédagogie spécialisé dans la création d'exercices. 
Crée une fiche d'exercices claire et structurée avec ces règles strictes de formatage :
- Texte aligné à gauche uniquement
- Pas d'indentation excessive
- Titres en MAJUSCULES
- Questions numérotées clairement
- Espacement optimisé pour la lisibilité
- Structure hiérarchique claire`;

    const userPrompt = `Crée ${numberOfExercises} exercices en ${subject} pour le niveau ${classLevel}.

Objectif pédagogique : ${objective}
${exerciseType ? `Type d'exercice : ${exerciseType}` : ''}
Nombre de questions par exercice : ${questionsPerExercise}

${specificNeeds ? `Besoins spécifiques : ${specificNeeds}` : ''}
${challenges ? `Points de vigilance : ${challenges}` : ''}
${additionalInstructions ? `Consignes particulières : ${additionalInstructions}` : ''}

Structure attendue :

FICHE ÉLÈVE

[EXERCICE 1]
CONSIGNE : 
1. Question
2. Question
[répéter selon nombre de questions]

FICHE PÉDAGOGIQUE

[EXERCICE 1]
OBJECTIFS :
PRÉREQUIS :
CORRIGÉ :
1. Réponse
   Explicitation
   Points de vigilance
   Remédiations

[Répéter pour chaque exercice]`;

    console.log('🤖 Appel OpenAI en cours...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur OpenAI:', error);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const exercises = data.choices[0].message.content;

    // Post-traitement pour garantir le formatage
    const cleanedExercises = exercises
      .replace(/###/g, '')
      .replace(/---/g, '')
      .replace(/\n\s+\n/g, '\n\n')  // Supprime l'espacement excessif
      .replace(/^\s+/gm, '')        // Supprime l'indentation en début de ligne
      .replace(/\[EXERCICE/g, '\n[EXERCICE')  // Assure l'espacement des sections
      .replace(/\n{3,}/g, '\n\n')   // Limite les sauts de ligne consécutifs
      .trim();

    const endTime = performance.now();
    console.log(`✅ Exercices générés en ${Math.round(endTime - startTime)}ms`);

    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({ exercises: cleanedExercises }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Erreur dans la fonction generate-exercises:', error);
    
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ 
          error: "Délai d'attente dépassé",
          details: "La génération a pris trop de temps, veuillez réessayer"
        }), 
        {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Une erreur est survenue lors de la génération des exercices'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
