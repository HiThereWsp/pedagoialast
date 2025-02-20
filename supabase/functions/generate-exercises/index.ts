
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Tu es un expert en pédagogie spécialisé dans la création d'exercices.
RÈGLES STRICTES:
- Texte aligné à gauche uniquement
- Titres en MAJUSCULES
- Questions numérotées
- Réponses concises et claires
- Format cohérent pour tous les exercices`;

interface ExerciseParams {
  subject: string;
  classLevel: string;
  numberOfExercises: number;
  questionsPerExercise: number;
  objective: string;
  exerciseType?: string;
  specificNeeds?: string;
  strengths?: string;
  challenges?: string;
}

function createPrompt(params: ExerciseParams): string {
  const {
    subject,
    classLevel,
    objective,
    numberOfExercises,
    questionsPerExercise,
    specificNeeds,
    exerciseType,
    strengths,
    challenges
  } = params;

  return `
MATIÈRE: ${subject}
NIVEAU: ${classLevel}
OBJECTIF: ${objective}
FORMAT: ${numberOfExercises} exercices, ${questionsPerExercise} questions/exercice
${specificNeeds ? `BESOINS SPÉCIFIQUES: ${specificNeeds}` : ''}
${exerciseType ? `TYPE: ${exerciseType}` : ''}
${strengths ? `POINTS FORTS: ${strengths}` : ''}
${challenges ? `DIFFICULTÉS: ${challenges}` : ''}

Structure requise:
FICHE ÉLÈVE
[Ex.1] à [Ex.${numberOfExercises}]
- Consignes claires
- Questions numérotées de 1 à ${questionsPerExercise}

FICHE PÉDAGOGIQUE
- Objectifs spécifiques
- Compétences travaillées
- Corrections détaillées
- Adaptations proposées
`;
}

async function* streamCompletion(payload: any) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: payload },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      stream: true,
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          console.error("Erreur parsing JSON:", e);
        }
      }
    }
  }
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔵 Réception d'une requête de génération d'exercices");

    // Utiliser directement req.json() au lieu de déstructurer body
    const requestData = await req.json();
    console.log("📥 Données reçues:", requestData);

    const {
      subject,
      classLevel,
      numberOfExercises,
      questionsPerExercise,
      objective,
      exerciseType,
      specificNeeds,
      strengths,
      challenges,
    } = requestData;

    // Validation des paramètres
    if (!subject || !classLevel || !objective) {
      console.error("❌ Paramètres manquants:", { subject, classLevel, objective });
      return new Response(
        JSON.stringify({ error: "Paramètres requis manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Validation des paramètres réussie");

    const prompt = createPrompt({
      subject,
      classLevel,
      numberOfExercises: Number(numberOfExercises) || 3,
      questionsPerExercise: Number(questionsPerExercise) || 5,
      objective,
      exerciseType,
      specificNeeds,
      strengths,
      challenges,
    });

    console.log("📝 Prompt généré avec succès");

    // Création d'un TransformStream pour le streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Streaming asynchrone
    (async () => {
      try {
        console.log("🔄 Début du streaming");
        for await (const chunk of streamCompletion(prompt)) {
          await writer.write(encoder.encode(chunk));
        }
        console.log("✅ Streaming terminé avec succès");
      } catch (error) {
        console.error("❌ Erreur streaming:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
