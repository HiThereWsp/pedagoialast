
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
      // Configuration de l'EventSource pour SSE
      const response = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          numberOfExercises: parseInt(formData.numberOfExercises) || 4,
          questionsPerExercise: parseInt(formData.questionsPerExercise) || 5,
        },
        responseType: 'stream',
      });

      if (!response.data) {
        throw new Error("Pas de données reçues");
      }

      let accumulatedContent = "";

      const reader = (response.data as ReadableStream).getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n\n').filter(Boolean);

        for (const event of events) {
          const [eventLine, dataLine] = event.split('\n');
          const eventType = eventLine.replace('event: ', '');
          const data = JSON.parse(dataLine.replace('data: ', ''));

          switch (eventType) {
            case 'start':
              console.log("🔵 Début du streaming");
              break;
            case 'content':
              accumulatedContent += data.content;
              setStreamingContent(accumulatedContent);
              break;
            case 'error':
              throw new Error(data.message);
            case 'end':
              console.log("✅ Streaming terminé");
              break;
          }
        }
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
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message === "Délai d'attente dépassé" 
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
