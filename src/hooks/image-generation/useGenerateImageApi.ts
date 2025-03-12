
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';

export const useGenerateImageApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const isGenerating = useRef(false);

  const generateImageApi = async (enhancedPrompt: string): Promise<string | null> => {
    // Empêcher les générations multiples simultanées
    if (isGenerating.current) {
      console.log('Génération déjà en cours, ignorée');
      return null;
    }
    
    isGenerating.current = true;
    const startTime = Date.now();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        }
      });

      if (error) throw error;

      if (data?.output) {
        setImageUrl(data.output);
        
        await logToolUsage(
          'image_generation',
          'generate',
          enhancedPrompt.length,
          Date.now() - startTime
        );

        toast({
          title: "Image générée avec succès",
          description: "Votre image a été créée avec succès.",
        });
        
        return data.output;
      } else {
        throw new Error('Pas d\'URL d\'image dans la réponse');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la génération de l\'image';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Le service de génération d\'images ne répond pas. Veuillez réessayer dans quelques instants.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Vous avez atteint votre limite de générations d\'images pour ce mois-ci.';
      } else if (error.message.includes('inappropriate')) {
        errorMessage = 'Le contenu demandé ne respecte pas nos conditions d\'utilisation.';
      }

      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage
      });
      
      return null;
    } finally {
      setIsLoading(false);
      // Garantir que le drapeau de génération est réinitialisé, même en cas d'erreur
      setTimeout(() => {
        isGenerating.current = false;
      }, 500);
    }
  };

  return {
    isLoading,
    imageUrl,
    generateImageApi,
    setImageUrl
  };
};
