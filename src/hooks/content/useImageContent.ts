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
  const saveInProgress = useRef(false);
  const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache
  const MAX_IMAGES = 50; // Limiter le nombre d'images

  const isCacheValid = useCallback(() => {
    return imageCache.current && (Date.now() - lastFetchTime.current < CACHE_TTL);
  }, []);

  const saveImage = async (params: {
    prompt: string;
    image_url?: string;
  }): Promise<ImageGenerationUsage | null> => {
    // Éviter les sauvegardes simultanées
    if (saveInProgress.current) {
      console.log('Sauvegarde déjà en cours, ignorée');
      return null;
    }
    
    saveInProgress.current = true;
    
    try {
      // Vérification de l'authentification avec gestion d'erreur silencieuse
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.warn('Erreur d'authentification silencieuse:', authError.message);
        return null;
      }
      
      if (!user) {
        console.log('Utilisateur non authentifié, sauvegarde ignorée');
        return null;
      }
      
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

      if (error) {
        console.error('Erreur lors de l\'insertion de l\'image:', error);
        
        if (!params.image_url) {
          // Seulement afficher un toast si ce n'est pas une sauvegarde silencieuse
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de sauvegarder l'image"
          });
        }
        
        throw error;
      }

      // Vérification simple que l'objet retourné est valide
      if (!record || typeof record !== 'object' || !('id' in record)) {
        throw new Error('Données d\'image invalides retournées par la base de données');
      }

      // Invalider le cache après ajout d'une nouvelle image
      imageCache.current = null;

      if (params.image_url) {
        toast({
          description: "Image sauvegardée avec succès",
        });
      }

      return record as ImageGenerationUsage;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'image:', err);
      
      // Ne pas afficher de toast en cas d'erreur lors de la sauvegarde silencieuse
      if (params.image_url) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        });
      }
      
      return null;
    } finally {
      // Réinitialiser le flag de sauvegarde
      setTimeout(() => {
        saveInProgress.current = false;
      }, 500);
    }
  };

  const retryFailedImage = async (recordId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non authentifié lors de la nouvelle tentative');
        return false;
      }
      
      const { data: record, error: fetchError } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', user.id) // Vérifier que l'image appartient à l'utilisateur
        .single();

      if (fetchError || !record) {
        console.error('Erreur ou image non trouvée:', fetchError);
        return false;
      }

      const currentRetryCount = record.retry_count || 0;
      if (currentRetryCount >= 3) {
        console.log('Nombre maximal de tentatives atteint');
        return false;
      }

      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({
          status: 'processing',
          retry_count: currentRetryCount + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('user_id', user.id); // S'assurer que l'image appartient à l'utilisateur

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'image:', updateError);
        return false;
      }

      // Invalider le cache après modification
      imageCache.current = null;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la nouvelle tentative de génération d\'image:', error);
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
        .limit(MAX_IMAGES);

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
