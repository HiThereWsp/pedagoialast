
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GenerationPrompt } from "../image-generation/types";
import { useAuth } from "@/hooks/useAuth";

export const useGenerateImageApi = () => {
  const { user } = useAuth();

  const generateImage = async (generationPrompt: GenerationPrompt): Promise<string | null> => {
    try {
      // Call the Supabase edge function to generate the image
      const { data: imageGenerationResponse, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: generationPrompt.prompt,
          style: generationPrompt.style,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Error calling image generation function:', error);
        return null;
      }

      if (imageGenerationResponse && imageGenerationResponse.url) {
        return imageGenerationResponse.url;
      }

      return null;
    } catch (error) {
      console.error('Error in generateImage:', error);
      return null;
    }
  };

  return {
    generateImage
  };
};
