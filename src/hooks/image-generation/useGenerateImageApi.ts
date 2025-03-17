
import { useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GenerationPrompt } from "./types";
import { useAuth } from "@/hooks/useAuth";

const API_TIMEOUT = 30000; // 30 secondes

export const useGenerateImageApi = () => {
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelPendingRequests = () => {
    if (abortControllerRef.current) {
      console.log('Annulation des requêtes en cours...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const generateImage = async (generationPrompt: GenerationPrompt): Promise<string | null> => {
    try {
      // Annuler toute requête précédente
      cancelPendingRequests();
      
      // Créer un nouveau contrôleur d'annulation
      abortControllerRef.current = new AbortController();
      
      console.log('Début de génération d\'image avec le prompt:', generationPrompt.prompt);
      
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Délai d\'attente dépassé pour la génération d\'image')), API_TIMEOUT);
      });
      
      // Appel à la fonction Edge
      // Removed the signal property as it's not supported in FunctionInvokeOptions
      const apiPromise = supabase.functions.invoke('generate-image', {
        body: {
          prompt: generationPrompt.prompt,
          style: generationPrompt.style,
          userId: user?.id
        }
      });
      
      // Race entre le timeout et l'appel API
      const result = await Promise.race([apiPromise, timeoutPromise]);
      
      if (!result) return null;
      
      const { data: imageGenerationResponse, error } = result as any;

      if (error) {
        console.error('Erreur lors de l\'appel de la fonction de génération d\'image:', error);
        throw new Error(error.message || 'Erreur lors de la génération de l\'image');
      }

      console.log('Réponse API de génération d\'image reçue:', imageGenerationResponse);

      if (imageGenerationResponse && imageGenerationResponse.url) {
        return imageGenerationResponse.url;
      }

      return null;
    } catch (error) {
      // Ignorer les erreurs d'annulation
      if ((error as Error).name === 'AbortError') {
        console.log('Requête de génération d\'image annulée');
        return null;
      }
      
      console.error('Erreur dans generateImage:', error);
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  };

  return {
    generateImage,
    cancelPendingRequests
  };
};
