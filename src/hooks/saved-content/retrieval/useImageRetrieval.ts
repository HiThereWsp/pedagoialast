
import { useCallback } from "react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useContentCache } from "../useContentCache";
import { useContentErrors } from "../useContentErrors";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook spécialisé pour la récupération des images
 */
export function useImageRetrieval() {
  const { getSavedImages, isLoadingImages } = useSavedContent();
  const { addError, clearError } = useContentErrors();
  const { setDataReceived } = useContentCache();

  // Récupérer les images
  const retrieveImages = useCallback(async (signal: AbortSignal, forceRefresh = false, requestId: number): Promise<SavedContent[]> => {
    try {
      if (!signal.aborted) {
        console.log(`🖼️ [Requête ${requestId}] Récupération des images en cours...`);
        // Passer forceRefresh pour garantir des données fraîches si nécessaire
        const imageData = await getSavedImages(forceRefresh);
        console.log(`🖼️ [Requête ${requestId}] Images récupérées: ${imageData.length}`);
        
        // Transformer les données d'image en format SavedContent
        const images: SavedContent[] = imageData.map(img => ({
          id: img.id,
          title: "Image générée",
          content: img.image_url || '',
          created_at: img.generated_at || new Date().toISOString(),
          type: 'Image' as const,
          displayType: 'Image générée',
          tags: [{
            label: 'Image',
            color: '#F2FCE2',
            backgroundColor: '#F2FCE220',
            borderColor: '#F2FCE24D'
          }]
        }));

        if (images.length > 0) {
          setDataReceived(true);
        }
        
        clearError('images');
        return images;
      }
      return [];
    } catch (err) {
      console.error(`❌ [Requête ${requestId}] Erreur lors de la récupération des images:`, err);
      addError('images', "Impossible de charger les images");
      return [];
    }
  }, [getSavedImages, addError, clearError, setDataReceived]);

  return {
    retrieveImages,
    isLoadingImages
  };
}
