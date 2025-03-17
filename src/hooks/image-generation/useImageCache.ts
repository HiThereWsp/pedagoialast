
import { useCallback } from 'react';

const IMAGE_CACHE_KEY = 'pedagogia_image_generation_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface CachedImage {
  url: string;
  prompt: string;
  style?: string;
  timestamp: number;
}

export function useImageCache() {
  const saveToCache = useCallback((url: string, prompt: string, style?: string) => {
    try {
      const cache: CachedImage = {
        url,
        prompt,
        style,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
      console.log('Image sauvegardée dans le cache:', cache);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde dans le cache:', error);
    }
  }, []);

  const getFromCache = useCallback(() => {
    try {
      const cachedData = sessionStorage.getItem(IMAGE_CACHE_KEY);
      
      if (!cachedData) {
        console.log('Pas de cache d\'image trouvé');
        return null;
      }
      
      const cache: CachedImage = JSON.parse(cachedData);
      
      // Vérifier l'expiration du cache
      if (Date.now() - cache.timestamp > CACHE_EXPIRY) {
        console.log('Cache d\'image expiré');
        sessionStorage.removeItem(IMAGE_CACHE_KEY);
        return null;
      }
      
      console.log('Image récupérée depuis le cache:', cache);
      return cache;
    } catch (error) {
      console.warn('Erreur lors de la récupération depuis le cache:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      sessionStorage.removeItem(IMAGE_CACHE_KEY);
      console.log('Cache d\'image effacé');
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    }
  }, []);

  return {
    saveToCache,
    getFromCache,
    clearCache
  };
}
