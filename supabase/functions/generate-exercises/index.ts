
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

async function sendSSEMessage(writer: WritableStreamDefaultWriter, event: string, data: any) {
  const encoder = new TextEncoder();
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  await writer.write(encoder.encode(message));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    console.log("🔵 Réception d'une requête de génération d'exercices");
    const requestData = await req.json();

    if (!requestData.subject || !requestData.classLevel || !requestData.objective) {
      await sendSSEMessage(writer, "error", { message: "Paramètres requis manquants" });
      writer.close();
      return new Response(stream.readable, { headers: corsHeaders });
    }

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
            content: "Tu es un expert en pédagogie spécialisé dans la création d'exercices adaptés au niveau scolaire français." 
          },
          { 
            role: "user", 
            content: `Crée ${requestData.numberOfExercises} exercices de ${requestData.subject} pour le niveau ${requestData.classLevel} avec l'objectif: ${requestData.objective}
            ${requestData.specificNeeds ? `\nBesoins spécifiques: ${requestData.specificNeeds}` : ''}
            ${requestData.exerciseType ? `\nType d'exercice: ${requestData.exerciseType}` : ''}
            Format: ${requestData.questionsPerExercise} questions par exercice.` 
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API OpenAI: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            continue;
          }

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

    await sendSSEMessage(writer, "end", { status: "completed" });
    console.log("✅ Génération terminée avec succès");

  } catch (error) {
    console.error("❌ Erreur pendant la génération:", error);
    await sendSSEMessage(writer, "error", { 
      error: true,
      message: error.message 
    });
  } finally {
    writer.close();
  }

  return new Response(stream.readable, { headers: corsHeaders });
});
