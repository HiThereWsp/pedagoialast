
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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

    console.log("📝 Début de la génération pour:", { 
      subject, classLevel, objective
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

    console.log('🤖 Initialisation de la requête OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: baseSystemPrompt },
          { role: 'user', content: isDifferentiation ? differentiatePrompt : generatePrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur OpenAI:', errorText);
      throw new Error(`Erreur API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Réponse OpenAI reçue');
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Contenu de la réponse invalide');
    }

    const exercises = data.choices[0].message.content;
    const cleanedExercises = exercises
      .replace(/###/g, '')
      .replace(/---/g, '')
      .replace(/\n\s+\n/g, '\n\n')
      .replace(/^\s+/gm, '')
      .replace(/\[EXERCICE/g, '\n[EXERCICE')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log('✅ Exercices générés et formatés avec succès');

    return new Response(
      JSON.stringify({ exercises: cleanedExercises }), 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erreur dans la fonction generate-exercises:', error);
    
    const errorResponse = {
      error: error.message,
      details: 'Une erreur est survenue lors de la génération des exercices'
    };

    return new Response(
      JSON.stringify(errorResponse), 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
