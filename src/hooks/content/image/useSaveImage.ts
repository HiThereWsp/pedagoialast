
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { ImageGenerationUsage } from "@/types/saved-content";
import { SaveImageParams } from './types';
import { getAuthenticatedUser, prepareImageRecord } from './imageContentUtils';

/**
 * Hook for saving generated images
 * @returns Functions and state for saving images
 */
export function useSaveImage() {
  const { toast } = useToast();
  const saveInProgress = useRef(false);

  const saveImage = async (params: SaveImageParams): Promise<ImageGenerationUsage | null> => {
    // Éviter les sauvegardes simultanées
    if (saveInProgress.current) {
      console.log('Sauvegarde déjà en cours, ignorée');
      return null;
    }
    
    saveInProgress.current = true;
    
    try {
      const user = await getAuthenticatedUser();
      
      if (!user) {
        console.log('Utilisateur non authentifié, sauvegarde ignorée');
        return null;
      }
      
      const newRecord = prepareImageRecord(params, user.id);

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

  return { saveImage };
}
