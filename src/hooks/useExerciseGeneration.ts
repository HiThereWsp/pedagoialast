
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  questionsPerExercise: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  strengths: string;
  challenges: string;
}

export interface GenerationResult {
  content: string;
  title: string;
  metadata: {
    subject: string;
    classLevel: string;
    exerciseType: string;
    specificNeeds: string;
  };
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const generateExercises = async (formData: ExerciseFormData): Promise<GenerationResult | null> => {
    setIsLoading(true);
    setStreamingContent("");
    setError(null);
    console.log("🔵 Début de la génération d'exercices");

    try {
      const response = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: parseInt(formData.numberOfExercises) || 4,
          questionsPerExercise: parseInt(formData.questionsPerExercise) || 5,
        }
      });

      if (!response.data) {
        throw new Error("Pas de données reçues");
      }

      const reader = new ReadableStreamDefaultReader(response.data as ReadableStream);
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const events = chunk.split('\n\n').filter(Boolean);

          for (const event of events) {
            const [eventLine, dataLine] = event.split('\n');
            if (!eventLine || !dataLine) continue;

            const eventType = eventLine.replace('event: ', '');
            try {
              const data = JSON.parse(dataLine.replace('data: ', ''));

              switch (eventType) {
                case 'start':
                  console.log("🔵 Début du streaming");
                  break;
                case 'content':
                  if (data.content) {
                    accumulatedContent += data.content;
                    setStreamingContent(accumulatedContent);
                  }
                  break;
                case 'error':
                  throw new Error(data.message || "Erreur lors de la génération");
                case 'end':
                  console.log("✅ Streaming terminé");
                  break;
              }
            } catch (e) {
              console.error("Erreur lors du parsing des données:", e);
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!accumulatedContent) {
        throw new Error("Aucun contenu n'a été généré");
      }

      const result: GenerationResult = {
        content: accumulatedContent,
        title: `${formData.subject} - ${formData.objective}`,
        metadata: {
          subject: formData.subject,
          classLevel: formData.classLevel,
          exerciseType: formData.exerciseType,
          specificNeeds: formData.specificNeeds,
        }
      };

      return result;

    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error);
      setError(error instanceof Error ? error.message : "Une erreur inattendue est survenue");
      toast({
        title: "Erreur",
        description: error instanceof Error && error.message === "Délai d'attente dépassé"
          ? "La génération a pris trop de temps, veuillez réessayer"
          : "Une erreur est survenue lors de la génération des exercices",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateExercises,
    streamingContent,
    error
  };
}
