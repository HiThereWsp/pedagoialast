import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  // Paramètres originaux du plan de leçon
  class_level: string;
  subject: string;
  subject_matter: string;
  total_sessions: number;
  text?: string;
  additional_instructions?: string;
  
  // Paramètres spécifiques à la modification
  original_lesson_plan: string;
  modification_instructions: string;
}

async function modifyLessonPlan(body: RequestBody): Promise<string> {
  const { 
    class_level, 
    subject, 
    subject_matter, 
    total_sessions, 
    text, 
    additional_instructions, 
    original_lesson_plan, 
    modification_instructions 
  } = body;
  
  console.log('Modifying lesson plan with instructions:', {
    class_level, 
    subject,
    subject_matter,
    total_sessions,
    instructionsLength: modification_instructions.length,
    originalPlanLength: original_lesson_plan.length,
  });

  // Validation des entrées
  if (!original_lesson_plan) throw new Error('La séquence originale est requise');
  if (!modification_instructions) throw new Error('Les instructions de modification sont requises');
  if (!class_level) throw new Error('Le niveau de classe est requis');
  if (!subject) throw new Error('Les objectifs d\'apprentissage sont requis');
  if (!subject_matter) throw new Error('La matière est requise');

  // Construction du prompt pour la modification
  let prompt = `En tant qu'enseignant expert de l'Éducation Nationale française, votre tâche est de modifier une séquence pédagogique existante pour une classe de ${class_level} en ${subject_matter}, centrée sur ${subject}.`;
  
  prompt += `\n\nVoici la séquence pédagogique originale :\n\n${original_lesson_plan}`;
  
  prompt += `\n\nLes modifications demandées par l'enseignant sont :\n${modification_instructions}`;
  
  prompt += `\n\nVeuillez fournir la séquence modifiée complète, en conservant la structure initiale mais en intégrant toutes les modifications demandées. Assurez-vous que la séquence reste cohérente, pédagogiquement solide et adaptée au niveau ${class_level}.`;
  
  // Rappel des objectifs d'apprentissage
  prompt += `\n\nRappel des objectifs d'apprentissage précis : ${subject}`;
  
  if (additional_instructions) {
    prompt += `\n\nInstructions particulières initiales : ${additional_instructions}`;
  }

  prompt += `\n\nConservez la structure en ${total_sessions} séances et veillez à ce que le contenu modifié soit directement utilisable en classe.`;

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
            content: 'Vous êtes un assistant pédagogique spécialisé dans la création et la modification de séquences d\'enseignement pour l\'Éducation Nationale française. Vos réponses sont structurées, concises et directement applicables en classe.'
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
    console.log('Request body received for modification');
    
    // Extraction des champs
    const {
      class_level,
      subject,
      subject_matter,
      total_sessions,
      text,
      additional_instructions,
      original_lesson_plan,
      modification_instructions
    } = body;

    // Validation des champs obligatoires pour la modification
    if (!original_lesson_plan || !modification_instructions) {
      console.error('Missing required fields for modification');
      
      return new Response(
        JSON.stringify({
          error: 'MISSING_FIELDS',
          message: 'La séquence originale et les instructions de modification sont requises.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      const lessonPlan = await modifyLessonPlan({
        class_level,
        subject,
        subject_matter,
        total_sessions,
        text,
        additional_instructions,
        original_lesson_plan,
        modification_instructions
      });

      return new Response(
        JSON.stringify({ lessonPlan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error modifying lesson plan:', error);

      // Gestion spécifique pour l'erreur de timeout
      if (error.message && error.message.includes('trop de temps')) {
        return new Response(
          JSON.stringify({
            error: 'TIMEOUT_ERROR',
            message: 'La modification de votre séquence est plus complexe que prévu. Essayez de simplifier vos instructions de modification.'
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