
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { SavedContent } from "@/types/saved-content";

export function useImageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveImage = async (params: {
    prompt: string;
    image_url: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('image_generation_usage')
        .insert([{
          prompt: params.prompt,
          image_url: params.image_url,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      });
      throw error;
    }
  };

  const getSavedImages = async () => {
    try {
      setIsLoading(true);
      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      return images.map(img => ({
        id: img.id,
        title: img.prompt,
        content: img.image_url,
        created_at: img.generated_at || img.created_at || new Date().toISOString(),
        type: 'Image' as const,
        displayType: 'Image',
        tags: [{
          label: 'Image',
          color: '#F2FCE2',
          backgroundColor: '#F2FCE220',
          borderColor: '#F2FCE24D'
        }]
      })) as SavedContent[];
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveImage,
    getSavedImages
  };
}
