
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subject,
      classLevel,
      numberOfExercises,
      questionsPerExercise,
      objective,
      exerciseType,
      additionalInstructions,
      specificNeeds,
      strengths,
      challenges,
    } = await req.json();

    console.log('Generating exercises with parameters:', {
      subject,
      classLevel,
      numberOfExercises,
      objective,
    });

    const systemPrompt = `Tu es un professeur expérimenté qui crée des exercices pédagogiques. 

    Règles importantes pour le format:
    - Commence par "Fiche élève" une seule fois
    - Liste les exercices numérotés
    - Chaque exercice DOIT commencer par une consigne claire et détaillée
    - La consigne doit expliquer exactement ce que l'élève doit faire
    - Termine par une section "FICHE PÉDAGOGIQUE" avec :
      * Les consignes détaillées pour l'enseignant
      * Les corrections complètes
      * Les explications pédagogiques

    Règles pour le contenu:
    - Propose toujours au minimum 3 exercices différents si le nombre n'est pas spécifié
    - Chaque exercice doit contenir au minimum 3 questions si le nombre n'est pas spécifié
    - Ne jamais proposer un seul exercice ou une seule question par exercice
    - Les consignes doivent être adaptées au niveau des élèves
    - Utilise un vocabulaire précis et adapté au niveau`;

    const userPrompt = `Crée ${numberOfExercises || '3'} exercice(s) de ${subject} pour une classe de ${classLevel}.
    Chaque exercice doit contenir ${questionsPerExercise || '3'} question(s) minimum.
    
    Objectif pédagogique / Thème: ${objective}
    Type d'exercice souhaité: ${exerciseType || 'Au choix'}
    ${additionalInstructions ? `Instructions supplémentaires: ${additionalInstructions}` : ''}
    ${specificNeeds ? `Besoins spécifiques: ${specificNeeds}` : ''}
    ${strengths ? `Points forts: ${strengths}` : ''}
    ${challenges ? `Défis: ${challenges}` : ''}
    
    Assure-toi que:
    1. Chaque exercice a une consigne claire et explicite
    2. Les exercices sont progressifs et adaptés au niveau
    3. Les consignes sont visibles et bien formatées`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Generated response:', data);

    return new Response(JSON.stringify({ 
      exercises: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating exercises:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération des exercices' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
