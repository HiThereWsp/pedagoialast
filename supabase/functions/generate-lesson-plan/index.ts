
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  class_level: string;
  total_sessions: number;
  subject: string;
  subject_matter: string;
  text?: string;
  additional_instructions?: string;
}

async function generateLessonPlan(body: RequestBody): Promise<string> {
  const { class_level, total_sessions, subject, subject_matter, text, additional_instructions } = body;
  
  console.log('Generating lesson plan with params:', {
    class_level, 
    total_sessions, 
    subject,
    subject_matter,
    textLength: text ? text.length : 0,
    additional_instructionsLength: additional_instructions ? additional_instructions.length : 0
  });

  // Validation des entrées
  if (!class_level) throw new Error('Le niveau de classe est requis');
  if (!total_sessions) throw new Error('Le nombre de séances est requis');
  if (!subject) throw new Error('Les objectifs d\'apprentissage sont requis');
  if (!subject_matter) throw new Error('La matière est requise');

  // Construction du prompt avec une introduction simplifiée
  let prompt = `En tant qu'enseignant expert de l'Éducation Nationale française, créez une séquence pédagogique détaillée pour une classe de ${class_level} en ${subject_matter}, centrée sur ${subject}.`;

  // Ajout des objectifs d'apprentissage (maintenant obligatoires)
  prompt += `\n\nObjectifs d'apprentissage précis : ${subject}`;
  
  // Ajout du texte optionnel
  if (text) {
    prompt += `\n\nTexte ou ressource à utiliser : ${text}`;
  }

  // Ajout des instructions supplémentaires
  if (additional_instructions) {
    prompt += `\n\nInstructions particulières : ${additional_instructions}`;
  }

  // Structure simplifiée
  prompt += `\n\nStructurez votre séquence en ${total_sessions || '4'} séances, avec les sections suivantes OBLIGATOIRES :
1. Objectifs et prérequis
2. Organisation (durée et matériel)
3. Déroulement détaillé des séances
4. Évaluation
5. Prolongements

Important : Concentrez-vous sur des contenus directement utilisables en classe. Évitez les formulations trop générales.`;

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
            content: 'Vous êtes un assistant pédagogique spécialisé dans la création de séquences d\'enseignement pour l\'Éducation Nationale française. Vos réponses sont structurées, concises et directement applicables en classe.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
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
    console.log('Request body received:', body);
    
    // Extraction et validation des champs
    const class_level = body.class_level || body.classLevel;
    const total_sessions = body.total_sessions || body.totalSessions;
    const subject = body.subject;
    const subject_matter = body.subject_matter || body.subjectMatter;
    const text = body.text;
    const additional_instructions = body.additional_instructions || body.additionalInstructions;

    // Conversion à des types attendus
    const parsedTotalSessions = typeof total_sessions === 'string' ? parseInt(total_sessions) : total_sessions;

    // Vérification des champs obligatoires
    if (!class_level || !total_sessions || !subject || !subject_matter) {
      console.error('Missing required fields:', { 
        class_level, 
        total_sessions: parsedTotalSessions, 
        subject, 
        subject_matter 
      });
      
      return new Response(
        JSON.stringify({
          error: 'MISSING_FIELDS',
          message: 'Certains champs obligatoires sont manquants : niveau de classe, nombre de séances, objectifs d\'apprentissage et matière sont requis.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      const lessonPlan = await generateLessonPlan({
        class_level,
        total_sessions: parsedTotalSessions,
        subject,
        subject_matter,
        text,
        additional_instructions
      });

      return new Response(
        JSON.stringify({ lessonPlan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error generating lesson plan:', error);

      // Gestion spécifique pour l'erreur de timeout
      if (error.message && error.message.includes('trop de temps')) {
        return new Response(
          JSON.stringify({
            error: 'TIMEOUT_ERROR',
            message: 'La génération de votre séquence est plus complexe que prévu. Voici quelques suggestions : réduire le nombre de séances, simplifier les instructions supplémentaires, ou diviser votre demande en plusieurs séquences plus courtes.'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'GENERATION_ERROR',
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
