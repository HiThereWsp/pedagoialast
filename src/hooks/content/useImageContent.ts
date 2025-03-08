
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { ImageGenerationUsage } from "@/types/saved-content";
import { isImageGenerationUsage } from "@/utils/type-guards";

export function useImageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const imageCache = useRef<ImageGenerationUsage[] | null>(null);
  const lastFetchTime = useRef<number>(0);
  const CACHE_TTL = 60000; // 1 minute cache

  const isCacheValid = () => {
    return imageCache.current && (Date.now() - lastFetchTime.current < CACHE_TTL);
  };

  const saveImage = async (params: {
    prompt: string;
    image_url?: string;
  }): Promise<ImageGenerationUsage | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const newRecord: Omit<ImageGenerationUsage, 'id'> = {
        prompt: params.prompt,
        user_id: user.id,
        generated_at: new Date().toISOString(),
        status: params.image_url ? 'success' : 'pending',
        retry_count: 0,
        monthly_generation_count: 0,
        generation_month: new Date().toISOString().slice(0, 7) + '-01',
        image_url: params.image_url || null
      };

      const { data: record, error } = await supabase
        .from('image_generation_usage')
        .insert(newRecord)
        .select()
        .single();

      if (error) throw error;

      if (!isImageGenerationUsage(record)) {
        throw new Error('Invalid image data returned from database');
      }

      // Invalider le cache après ajout d'une nouvelle image
      imageCache.current = null;

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
      if (currentRetryCount >= 3) return false;

      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({
          status: 'processing' as const,
          retry_count: currentRetryCount + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId);

      if (updateError) return false;

      // Invalider le cache après modification
      imageCache.current = null;

      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error retrying image:', error);
      return false;
    }
  };

  const getSavedImages = async () => {
    try {
      // Utiliser le cache si disponible et valide
      if (isCacheValid()) {
        console.log('Utilisation du cache pour les images');
        return imageCache.current;
      }

      setIsLoading(true);
      console.log('Début de la récupération des images...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('generated_at', { ascending: false })
        .limit(100); // Limiter le nombre d'images pour éviter les problèmes de performance

      if (error) throw error;

      if (!images || !Array.isArray(images)) {
        console.log('Aucune image trouvée ou format invalide');
        return [];
      }

      console.log('Images récupérées:', images.length);

      const validImages = images.filter(isImageGenerationUsage);
      console.log('Images valides:', validImages.length);
      
      // Mettre à jour le cache
      imageCache.current = validImages;
      lastFetchTime.current = Date.now();
      
      return validImages;
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
