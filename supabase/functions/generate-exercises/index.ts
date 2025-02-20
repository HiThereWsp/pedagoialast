
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

const TIMEOUT_MS = 25000; // 25 secondes de timeout

serve(async (req) => {
  // Gestion du CORS préflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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
      originalExercise = '',
      studentProfile = '',
      learningDifficulties = '',
      isDifferentiation = false
    } = requestData;

    console.log("📝 Paramètres reçus:", { 
      subject, classLevel, objective,
      numberOfExercises, questionsPerExercise,
      exerciseType, specificNeeds,
      isDifferentiation
    });

    const baseSystemPrompt = `Tu es un expert en pédagogie spécialisé dans la création d'exercices. 
Ta mission est de créer une fiche d'exercices claire et structurée en suivant ces règles strictes :
- Titres EN MAJUSCULES sans formatage
- Alignement gauche strict
- Numérotation simple (1., 2., etc.)
- Espace simple entre sections
- Retour à la ligne si nécessaire
- Langage adapté au niveau ${classLevel}`;

    const generatePrompt = `
Génère des exercices scolaires pour ${subject} niveau ${classLevel}.

STRUCTURE STRICTE À SUIVRE :

FICHE ÉLÈVE
[EXERCICE X] (répéter ${numberOfExercises} fois)
Consigne :
[${questionsPerExercise} questions maximum]

FICHE PÉDAGOGIQUE
[EXERCICE X]
OBJECTIFS : ${objective}
MATÉRIEL NÉCESSAIRE : [à déduire selon le contexte]
NOTIONS PRÉALABLES : [à déduire selon le niveau/objectif]
CORRIGÉ :
1. Réponse brève
   Explicitation (2 phrases max)
${additionalInstructions ? `Instructions supplémentaires : ${additionalInstructions}` : ''}

FICHE ÉLÈVE AVEC CORRECTION EXPLIQUÉE
1. Question
Correction : Phrase unique
Explication : 1-2 phrases claires`;

    const differentiatePrompt = `
Adapte cet exercice pour ${classLevel} avec les besoins spécifiques suivants : ${specificNeeds}

EXERCICE ORIGINAL :
${originalExercise}

STRUCTURE DE SORTIE :
FICHE ÉLÈVE (adaptée)
[Même format que l'original mais adapté]

FICHE PÉDAGOGIQUE
OBJECTIFS : ${objective}
MATÉRIEL NÉCESSAIRE : [à déduire + adaptations nécessaires]
NOTIONS PRÉALABLES : [à déduire + points d'attention]
ADAPTATIONS SPÉCIFIQUES : 
- Pour le profil : ${studentProfile}
- Difficultés : ${learningDifficulties}
CORRIGÉ :
[Format standard avec adaptations]

FICHE ÉLÈVE AVEC CORRECTION EXPLIQUÉE
[Version adaptée avec explications simplifiées si nécessaire]`;

    console.log('🤖 Appel OpenAI en cours...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: baseSystemPrompt },
          { role: 'user', content: isDifferentiation ? differentiatePrompt : generatePrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur OpenAI:', error);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Pas de contenu généré');
    }

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

    clearTimeout(timeoutId);
    
    return new Response(
      JSON.stringify({ exercises: cleanedExercises }), 
      { headers: corsHeaders }
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
          headers: corsHeaders,
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
        headers: corsHeaders,
      }
    );
  }
});
