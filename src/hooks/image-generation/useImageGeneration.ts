
import { useEffect, useRef } from 'react';
import { GenerationPrompt } from "./types";
import { UseImageGenerationResult } from './types';
import { useGenerateImageApi } from './useGenerateImageApi';
import { useContentScreening } from './useContentScreening';
import { useToast } from "@/hooks/use-toast";
import { useImageGenerationState } from './useImageGenerationState';
import { useImageCache } from './useImageCache';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

export const useImageGeneration = (): UseImageGenerationResult => {
  const { state, setLoading, setSuccess, setError, resetState, incrementRetry } = useImageGenerationState();
  const { toast } = useToast();
  const { generateImage, cancelPendingRequests } = useGenerateImageApi();
  const { containsInappropriateContent } = useContentScreening();
  const { saveToCache, getFromCache } = useImageCache();
  const operationInProgress = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);

  // Effet pour charger depuis le cache au montage du composant
  useEffect(() => {
    console.log('Initialisation du hook useImageGeneration');
    const cachedImage = getFromCache();
    
    if (cachedImage) {
      console.log('Image trouvée dans le cache, restauration de l\'état');
      setSuccess(cachedImage.url, cachedImage.prompt, cachedImage.style);
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      console.log('Nettoyage du hook useImageGeneration');
      cancelPendingRequests();
      
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      operationInProgress.current = false;
    };
  }, []);

  const retryGeneration = async () => {
    if (!state.lastPrompt || state.retryCount >= MAX_RETRIES) {
      console.log('Impossible de réessayer: pas de prompt précédent ou nombre maximum de tentatives atteint');
      return;
    }

    incrementRetry();
    await generateImage({
      prompt: state.lastPrompt.prompt,
      style: state.lastPrompt.style
    });
  };

  const generateImageWithRetry = async (generationPrompt: GenerationPrompt): Promise<void> => {
    try {
      // Nettoyage des tentatives précédentes
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      setLoading();
      
      const imageUrl = await generateImage(generationPrompt);
      
      if (imageUrl) {
        console.log('Image générée avec succès:', imageUrl);
        setSuccess(imageUrl, generationPrompt.prompt || '', generationPrompt.style);
        saveToCache(imageUrl, generationPrompt.prompt || '', generationPrompt.style);
      } else {
        console.error('Échec de génération d\'image: pas d\'URL retournée');
        setError('Impossible de générer l\'image. Veuillez réessayer.');
        
        // Tentative automatique de régénération après un délai
        if (state.retryCount < MAX_RETRIES) {
          console.log(`Nouvelle tentative automatique dans ${RETRY_DELAY}ms (tentative ${state.retryCount + 1}/${MAX_RETRIES})`);
          retryTimeoutRef.current = window.setTimeout(() => {
            retryGeneration();
          }, RETRY_DELAY);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
      setError((error as Error).message || 'Une erreur est survenue lors de la génération de l\'image.');
    } finally {
      operationInProgress.current = false;
    }
  };

  const generateImage = async (generationPrompt: GenerationPrompt): Promise<void> => {
    // Éviter les opérations multiples
    if (operationInProgress.current) {
      toast({
        description: "Une génération est déjà en cours, veuillez patienter"
      });
      return;
    }

    try {
      operationInProgress.current = true;
      
      // Validation du prompt
      if (!generationPrompt.prompt || (generationPrompt.user_prompt && generationPrompt.user_prompt.length < 3)) {
        toast({
          variant: "destructive",
          description: "Veuillez entrer une description plus détaillée (minimum 3 caractères)"
        });
        operationInProgress.current = false;
        return;
      }

      if (generationPrompt.user_prompt && generationPrompt.user_prompt.length > 1000) {
        toast({
          variant: "destructive",
          description: "La description est trop longue (maximum 1000 caractères)"
        });
        operationInProgress.current = false;
        return;
      }

      // Vérification du contenu inapproprié
      if (containsInappropriateContent(generationPrompt.prompt)) {
        toast({
          title: "Contenu inapproprié détecté",
          description: "Votre requête contient du contenu inapproprié. Veuillez modifier votre prompt.",
          variant: "destructive"
        });
        operationInProgress.current = false;
        return;
      }

      // Génération de l'image avec mécanisme de retry
      await generateImageWithRetry(generationPrompt);
      
    } catch (error) {
      console.error('Error in generateImage:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'image.",
        variant: "destructive"
      });
      operationInProgress.current = false;
    }
  };

  return {
    isLoading: state.status === 'LOADING',
    isError: state.status === 'ERROR',
    isSuccess: state.status === 'SUCCESS',
    isInitialized: state.isInitialized,
    error: state.error,
    generatedImageUrl: state.imageUrl,
    lastPrompt: state.lastPrompt,
    generateImage,
    retryGeneration
  };
};
