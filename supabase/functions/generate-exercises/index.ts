
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

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

async function sendSSEMessage(writer: WritableStreamDefaultWriter, event: string, data: any) {
  const encoder = new TextEncoder();
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  await writer.write(encoder.encode(message));
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔵 Réception d'une requête de génération d'exercices");
    const requestData = await req.json();

    // Validation des paramètres
    if (!requestData.subject || !requestData.classLevel || !requestData.objective) {
      console.error("❌ Paramètres manquants:", requestData);
      return new Response(
        JSON.stringify({ error: "Paramètres requis manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = createPrompt({
      subject: requestData.subject,
      classLevel: requestData.classLevel,
      numberOfExercises: Number(requestData.numberOfExercises) || 3,
      questionsPerExercise: Number(requestData.questionsPerExercise) || 5,
      objective: requestData.objective,
      exerciseType: requestData.exerciseType,
      specificNeeds: requestData.specificNeeds,
      strengths: requestData.strengths,
      challenges: requestData.challenges,
    });

    // Création du stream pour SSE
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Démarrer la génération en arrière-plan
    (async () => {
      try {
        console.log("🔄 Début de la génération");
        
        // Envoi du message de début
        await sendSSEMessage(writer, "start", { status: "started" });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { 
                role: "system", 
                content: "Tu es un expert en pédagogie spécialisé dans la création d'exercices." 
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          // Envoyer le contenu accumulé
          if (buffer.includes("\n")) {
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    await sendSSEMessage(writer, "content", { content });
                  }
                } catch (e) {
                  console.error("❌ Erreur parsing JSON:", e);
                }
              }
            }
          }
        }

        // Message de fin
        await sendSSEMessage(writer, "end", { status: "completed" });
        console.log("✅ Génération terminée avec succès");
      } catch (error) {
        console.error("❌ Erreur pendant la génération:", error);
        await sendSSEMessage(writer, "error", { 
          error: true,
          message: error.message 
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
