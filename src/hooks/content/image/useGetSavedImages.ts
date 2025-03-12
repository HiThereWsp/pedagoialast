
import { useState, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { ImageGenerationUsage } from "@/types/saved-content";
import { DEFAULT_CACHE_TTL, DEFAULT_MAX_IMAGES, getAuthenticatedUser, isCacheValid } from './imageContentUtils';

/**
 * Hook for retrieving saved images
 * @returns Functions and state for fetching saved images
 */
export function useGetSavedImages() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const imageCache = useRef<ImageGenerationUsage[] | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isFetchingImages = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const isCacheValidCallback = useCallback(() => {
    return isCacheValid(imageCache.current, lastFetchTime.current, DEFAULT_CACHE_TTL);
  }, []);

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
    if (isCacheValidCallback() && !forceRefresh) {
      console.log('Utilisation du cache pour les images');
      return imageCache.current || [];
    }

    try {
      isFetchingImages.current = true;
      setIsLoading(true);
      console.log('Début de la récupération des images...');

      const user = await getAuthenticatedUser();
      if (!user) {
        console.log('Utilisateur non connecté');
        return [];
      }

      console.log(`Récupération des images pour l'utilisateur ${user.id}`);
      
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
        .limit(DEFAULT_MAX_IMAGES);

      if (error) {
        console.error('Erreur lors de la récupération des images:', error);
        throw error;
      }

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
      return imageCache.current || []; // Utiliser le cache même en cas d'erreur
    } finally {
      setIsLoading(false);
      // Délai avant de permettre une nouvelle requête pour éviter les avalanches de requêtes
      setTimeout(() => {
        isFetchingImages.current = false;
      }, 1500); // Réduit de 2000ms à 1500ms
      
      // Réinitialiser le contrôleur d'annulation
      abortController.current = null;
    }
  };

  const invalidateCache = () => {
    imageCache.current = null;
    lastFetchTime.current = 0;
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
    getSavedImages,
    invalidateCache,
    cleanup
  };
}
