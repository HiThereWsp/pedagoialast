
import { useState, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { ImageGenerationUsage } from "@/types/saved-content";

export function useImageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const imageCache = useRef<ImageGenerationUsage[] | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isFetchingImages = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  const MAX_IMAGES = 50; // Limiter le nombre d'images

  const isCacheValid = useCallback(() => {
    return imageCache.current && (Date.now() - lastFetchTime.current < CACHE_TTL);
  }, []);

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

      // Vérification simple que l'objet retourné est valide
      if (!record || typeof record !== 'object' || !('id' in record)) {
        throw new Error('Invalid image data returned from database');
      }

      // Invalider le cache après ajout d'une nouvelle image
      imageCache.current = null;

      if (params.image_url) {
        toast({
          description: "Image sauvegardée avec succès",
        });
      }

      return record as ImageGenerationUsage;
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
          status: 'processing',
          retry_count: currentRetryCount + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId);

      if (updateError) return false;

      // Invalider le cache après modification
      imageCache.current = null;

      return true;
    } catch (error) {
      console.error('Error retrying image:', error);
      return false;
    }
  };

  const getSavedImages = async (forceRefresh = false): Promise<ImageGenerationUsage[]> => {
    // Annuler toute requête précédente en cours
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Créer un nouveau contrôleur d'annulation
    abortController.current = new AbortController();
    
    // Empêcher les appels concurrents
    if (isFetchingImages.current) {
      console.log('Récupération des images déjà en cours, ignorer cette demande');
      return imageCache.current || [];
    }

    // Utiliser le cache si disponible et valide et si on ne force pas le rafraîchissement
    if (isCacheValid() && !forceRefresh) {
      console.log('Utilisation du cache pour les images');
      return imageCache.current || [];
    }

    try {
      isFetchingImages.current = true;
      setIsLoading(true);
      console.log('Début de la récupération des images...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté');
        return [];
      }

      // Ajouter un délai pour éviter les requêtes trop rapprochées
      await new Promise(resolve => setTimeout(resolve, 300));

      // Vérifier si la requête a été annulée pendant le délai
      if (abortController.current?.signal.aborted) {
        throw new Error('Requête annulée');
      }

      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('generated_at', { ascending: false })
        .limit(MAX_IMAGES);

      if (error) throw error;

      if (!images || !Array.isArray(images)) {
        console.log('Aucune image trouvée ou format invalide');
        return [];
      }

      console.log('Images récupérées:', images.length);
      
      // Vérifier si la requête a été annulée après l'appel à Supabase
      if (abortController.current?.signal.aborted) {
        throw new Error('Requête annulée après récupération');
      }
      
      // Filtrer les images valides (avec URL d'image)
      const validImages = images.filter(img => 
        img !== null && 
        typeof img === 'object' && 
        'image_url' in img && 
        img.image_url
      );
      
      console.log('Images valides:', validImages.length);
      
      // Mettre à jour le cache
      imageCache.current = validImages as ImageGenerationUsage[];
      lastFetchTime.current = Date.now();
      
      return validImages as ImageGenerationUsage[];
    } catch (error) {
      if ((error as Error).message.includes('annulée')) {
        console.log('Requête annulée:', (error as Error).message);
        return imageCache.current || [];
      }
      
      console.error('Error fetching images:', error);
      return [];
    } finally {
      setIsLoading(false);
      // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
      setTimeout(() => {
        isFetchingImages.current = false;
      }, 2000);
      
      // Réinitialiser le contrôleur d'annulation
      abortController.current = null;
    }
  };

  // Fonction pour nettoyer les ressources lors du démontage du composant
  const cleanup = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    
    // Indiquer qu'aucune requête n'est en cours
    isFetchingImages.current = false;
  };

  return {
    isLoading,
    saveImage,
    getSavedImages,
    retryFailedImage,
    cleanup
  };
}
