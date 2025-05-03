import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  // Paramètres originaux de l'exercice
  subject: string;
  classLevel: string;
  numberOfExercises?: string;
  questionsPerExercise?: string;
  objective?: string;
  exerciseType?: string;
  additionalInstructions?: string;
  specificNeeds?: string;
  originalExercise?: string;
  studentProfile?: string;
  learningDifficulties?: string;
  selectedLessonPlan?: string;
  challenges?: string;
  isDifferentiation?: boolean;
  
  // Paramètres spécifiques à la modification
  exercise_content: string;  // Le contenu original de l'exercice
  modification_instructions: string;  // Les instructions de modification
}

async function modifyExercise(body: RequestBody): Promise<string> {
  const { 
    subject, 
    classLevel, 
    exercise_content,
    modification_instructions,
    isDifferentiation,
    ...otherParams
  } = body;
  
  console.log('Modifying exercise with instructions:', {
    subject, 
    classLevel,
    isDifferentiation,
    instructionsLength: modification_instructions.length,
    originalExerciseLength: exercise_content.length,
  });

  // Validation des entrées
  if (!exercise_content) throw new Error('L\'exercice original est requis');
  if (!modification_instructions) throw new Error('Les instructions de modification sont requises');
  if (!subject) throw new Error('La matière est requise');
  if (!classLevel) throw new Error('Le niveau de classe est requis');

  // Construction du prompt pour la modification
  let prompt = `En tant qu'enseignant expert de l'Éducation Nationale française, votre tâche est de modifier un exercice existant de ${subject} pour un niveau ${classLevel}.`;
  
  prompt += `\n\nVoici l'exercice original :\n\n${exercise_content}`;
  
  prompt += `\n\nLes modifications demandées par l'enseignant sont :\n${modification_instructions}`;
  
  prompt += `\n\nVeuillez fournir l'exercice modifié complet, en conservant la structure initiale mais en intégrant toutes les modifications demandées. Assurez-vous que l'exercice reste cohérent, pédagogiquement solide et adapté au niveau ${classLevel}.`;
  
  // Ajout des paramètres additionnels conditionnels
  if (otherParams.objective) {
    prompt += `\n\nObjectif pédagogique : ${otherParams.objective}`;
  }
  
  if (otherParams.additionalInstructions) {
    prompt += `\n\nInstructions particulières : ${otherParams.additionalInstructions}`;
  }
  
  if (otherParams.specificNeeds) {
    prompt += `\n\nBesoins spécifiques : ${otherParams.specificNeeds}`;
  }

  // Paramètres spécifiques à la différenciation
  if (isDifferentiation && otherParams.studentProfile) {
    prompt += `\n\nProfil de l'élève : ${otherParams.studentProfile}`;
  }
  
  if (isDifferentiation && otherParams.learningDifficulties) {
    prompt += `\n\nDifficultés d'apprentissage : ${otherParams.learningDifficulties}`;
  }
  
  if (isDifferentiation && otherParams.challenges) {
    prompt += `\n\nDéfis particuliers : ${otherParams.challenges}`;
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('API key not found');
  }

  // Mise en place d'un timeout pour éviter les requêtes trop longues
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 secondes

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'Vous êtes un assistant pédagogique spécialisé dans la création et la modification d\'exercices pour l\'Éducation Nationale française. Vos réponses sont structurées, concises et directement applicables en classe.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4, // Légèrement plus bas pour conserver une cohérence avec l'original
        max_tokens: 2500,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: -0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Gestion spécifique des erreurs d'abort (timeout)
    if (error.name === 'AbortError') {
      console.error('Request timed out after 60 seconds');
      throw new Error('La requête a pris trop de temps et a été interrompue');
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body received for exercise modification');
    
    // Validation des champs obligatoires pour la modification
    if (!body.exercise_content || !body.modification_instructions) {
      console.error('Missing required fields for modification');
      
      return new Response(
        JSON.stringify({
          error: 'MISSING_FIELDS',
          message: 'L\'exercice original et les instructions de modification sont requis.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      const exercises = await modifyExercise(body);

      return new Response(
        JSON.stringify({ exercises }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error modifying exercise:', error);

      // Gestion spécifique pour l'erreur de timeout
      if (error.message && error.message.includes('trop de temps')) {
        return new Response(
          JSON.stringify({
            error: 'TIMEOUT_ERROR',
            message: 'La modification de votre exercice est plus complexe que prévu. Essayez de simplifier vos instructions de modification.'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'MODIFICATION_ERROR',
          message: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: 'REQUEST_ERROR',
        message: 'Erreur lors du traitement de la requête. Vérifiez le format de vos données.'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 