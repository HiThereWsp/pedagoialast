
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

      const newRecord = {
        prompt: params.prompt,
        user_id: user.id,
        generated_at: new Date().toISOString(),
        status: (params.image_url ? 'success' : 'pending') as const,
        retry_count: 0,
        image_url: params.image_url || null
      };

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

      const currentRetryCount = record.retry_count || 0;
      if (currentRetryCount >= MAX_RETRIES) return false;

      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({
          status: 'processing',
          retry_count: currentRetryCount + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId);

      if (updateError) return false;

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
      console.log('Début de la récupération des images...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      // Vérification et transformation des données
      if (!images || !Array.isArray(images)) {
        console.log('Aucune image trouvée ou format invalide');
        return [];
      }

      console.log('Images récupérées:', images.length);

      // Validation et transformation des données
      const validImages = images.filter((img): img is ImageGenerationUsage => {
        const isValid = img !== null &&
          typeof img === 'object' &&
          'id' in img &&
          'prompt' in img &&
          'image_url' in img &&
          'generated_at' in img &&
          'status' in img &&
          img.status === 'success';

        if (!isValid) {
          console.log('Image invalide détectée:', img);
        }

        return isValid;
      });

      console.log('Images valides:', validImages.length);

      return validImages.map(img => ({
        id: img.id,
        title: img.prompt || "Image générée",
        content: img.image_url || '',
        created_at: img.generated_at,
        type: 'Image' as const,
        displayType: 'Image générée',
        tags: [{
          label: 'Image',
          color: '#F2FCE2',
          backgroundColor: '#F2FCE220',
          borderColor: '#F2FCE24D'
        }]
      }));
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

