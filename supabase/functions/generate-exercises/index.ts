
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import "https://deno.land/x/xhr@0.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const startTime = performance.now();
  console.log("🔵 Début de la génération d'exercices");

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
      challenges = '',
    } = requestData;

    console.log("📝 Paramètres reçus:", { 
      subject, 
      classLevel, 
      objective,
      numberOfExercises,
      questionsPerExercise,
      exerciseType,
      specificNeeds 
    });

    const prompt = `Crée ${numberOfExercises} exercices en ${subject} pour le niveau ${classLevel}.
    
Objectif pédagogique : ${objective}
${exerciseType ? `Type d'exercice : ${exerciseType}` : ''}
Nombre de questions par exercice : ${questionsPerExercise}

${specificNeeds ? `Besoins spécifiques : ${specificNeeds}` : ''}
${challenges ? `Points de vigilance : ${challenges}` : ''}
${additionalInstructions ? `Consignes particulières : ${additionalInstructions}` : ''}

FORMAT ATTENDU :

FICHE ÉLÈVE
-----------
[Exercice 1]
Consigne :
Questions :
1. 
2.
[répéter selon nombre de questions demandé]

[Répéter pour chaque exercice demandé]

FICHE PÉDAGOGIQUE
----------------
[Exercice 1]
Objectifs spécifiques :
Prérequis :
Corrigé détaillé :
1. [Réponse]
   Explicitation :
   Points de vigilance :
   Remédiations possibles :

[Répéter pour chaque exercice]`;

    console.log('🤖 Appel OpenAI en cours...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en pédagogie spécialisé dans la création d\'exercices adaptés aux élèves. Sois concis et direct dans tes exercices.'
          },
          {
            role: 'user',
            content: prompt
          }
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

    const endTime = performance.now();
    console.log(`✅ Exercices générés en ${Math.round(endTime - startTime)}ms`);

    return new Response(
      JSON.stringify({ exercises }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Erreur dans la fonction generate-exercises:', error);
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
