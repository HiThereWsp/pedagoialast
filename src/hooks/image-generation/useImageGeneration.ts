
import { useState } from 'react';
import { GenerationPrompt } from "./types";
import { UseImageGenerationResult } from './types';
import { useGenerateImageApi } from './useGenerateImageApi';
import { useContentScreening } from './useContentScreening';
import { useToast } from "@/hooks/use-toast";

export const useImageGeneration = (): UseImageGenerationResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { generateImage: callGenerateImageApi } = useGenerateImageApi();
  const { containsInappropriateContent } = useContentScreening();

  const generateImage = async (generationPrompt: GenerationPrompt): Promise<void> => {
    try {
      // Content screening check
      if (containsInappropriateContent(generationPrompt.prompt)) {
        toast({
          title: "Contenu inapproprié détecté",
          description: "Votre requête contient du contenu inapproprié. Veuillez modifier votre prompt.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      setGeneratedImageUrl(null);

      const imageUrl = await callGenerateImageApi(generationPrompt);
      
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de générer l'image. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'image.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatedImageUrl,
    generateImage
  };
};
