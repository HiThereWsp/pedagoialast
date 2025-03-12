
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useContentScreening } from './useContentScreening';
import { useGenerateImageApi } from './useGenerateImageApi';
import { useImageContent } from '@/hooks/content/useImageContent';
import { GenerationPrompt } from '@/components/image-generation/types';
import type { UseImageGenerationResult } from './types';

export const useImageGeneration = (): UseImageGenerationResult => {
  const [lastPrompt, setLastPrompt] = useState<GenerationPrompt | null>(null);
  const operationInProgress = useRef(false);
  const { toast } = useToast();
  const { containsInappropriateContent } = useContentScreening();
  const { isLoading, imageUrl: generatedImageUrl, generateImageApi } = useGenerateImageApi();
  const { saveImage } = useImageContent();

  const generateImage = async (generationPrompt: GenerationPrompt) => {
    // Éviter les opérations multiples
    if (operationInProgress.current) {
      toast({
        description: "Une génération est déjà en cours, veuillez patienter"
      });
      return;
    }

    if (generationPrompt.user_prompt.length < 3) {
      toast({
        variant: "destructive",
        description: "Veuillez entrer une description plus détaillée (minimum 3 caractères)"
      });
      return;
    }

    if (generationPrompt.user_prompt.length > 1000) {
      toast({
        variant: "destructive",
        description: "La description est trop longue (maximum 1000 caractères)"
      });
      return;
    }

    try {
      operationInProgress.current = true;
      setLastPrompt(generationPrompt);
      
      const enhancedPrompt = generationPrompt.style === 'auto' 
        ? `${generationPrompt.context} ${generationPrompt.user_prompt}`
        : `${generationPrompt.context} ${generationPrompt.user_prompt} (in ${generationPrompt.style} style)`;

      // Vérification du contenu inapproprié
      if (containsInappropriateContent(enhancedPrompt)) {
        throw new Error('Le contenu de votre prompt ne respecte pas nos conditions d\'utilisation');
      }

      // Créer d'abord l'enregistrement dans la base de données
      // Utiliser une sauvegarde silencieuse (sans affichage d'erreur) pour le statut "pending"
      await saveImage({
        prompt: generationPrompt.user_prompt
      });

      await generateImageApi(enhancedPrompt);
    } catch (error: any) {
      console.error('Error in generateImage:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération de l'image"
      });
    } finally {
      // Garantir que le drapeau est toujours réinitialisé
      setTimeout(() => {
        operationInProgress.current = false;
      }, 500);
    }
  };

  return {
    isLoading,
    generatedImageUrl,
    generateImage
  };
};
