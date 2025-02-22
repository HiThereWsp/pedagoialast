
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { SavedContent, ImageGenerationUsage } from "@/types/saved-content";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

export function useImageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveImage = async (params: {
    prompt: string;
    image_url?: string;
  }): Promise<ImageGenerationUsage | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const newRecord: Partial<ImageGenerationUsage> = {
        prompt: params.prompt,
        user_id: user.id,
        generated_at: new Date().toISOString(),
        status: params.image_url ? 'success' : 'pending',
        retry_count: 0
      };

      if (params.image_url) {
        newRecord.image_url = params.image_url;
      }

      const { data: record, error } = await supabase
        .from('image_generation_usage')
        .insert(newRecord)
        .select()
        .single();

      if (error) throw error;

      if (params.image_url) {
        toast({
          description: "Image sauvegardée avec succès",
        });
      }

      return record;
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      });
      return null;
    }
  };

  const retryFailedImage = async (recordId: string): Promise<boolean> => {
    try {
      const { data: record, error: fetchError } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError || !record) return false;

      if (record.retry_count >= MAX_RETRIES) return false;

      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({
          status: 'processing',
          retry_count: record.retry_count + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId);

      if (updateError) return false;

      // Attendez un délai avant de réessayer
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return true;
    } catch (error) {
      console.error('Error retrying image:', error);
      return false;
    }
  };

  const getSavedImages = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      return (images || []).map(img => ({
        id: img.id,
        title: img.prompt,
        content: img.image_url || '',
        created_at: img.generated_at || new Date().toISOString(),
        type: 'Image' as const,
        displayType: 'Image',
        tags: [{
          label: 'Image',
          color: '#F2FCE2',
          backgroundColor: '#F2FCE220',
          borderColor: '#F2FCE24D'
        }]
      })) satisfies SavedContent[];
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des images"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveImage,
    getSavedImages,
    retryFailedImage
  };
}
