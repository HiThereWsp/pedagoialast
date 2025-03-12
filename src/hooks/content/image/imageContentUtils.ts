
import { supabase } from '@/integrations/supabase/client';
import type { ImageGenerationUsage } from "@/types/saved-content";
import { SaveImageParams } from './types';

// Default cache time of 3 minutes
export const DEFAULT_CACHE_TTL = 3 * 60 * 1000;
// Default limit of images to fetch
export const DEFAULT_MAX_IMAGES = 50;

/**
 * Checks if the user is authenticated
 * @returns The user object or null if not authenticated
 */
export const getAuthenticatedUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.warn('Erreur d\'authentification silencieuse:', authError.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return null;
  }
};

/**
 * Prepares an image record for saving
 * @param params Parameters for the image to save
 * @param userId The user ID
 * @returns The image record ready to be inserted
 */
export const prepareImageRecord = (params: SaveImageParams, userId: string): Omit<ImageGenerationUsage, 'id'> => {
  return {
    prompt: params.prompt,
    user_id: userId,
    generated_at: new Date().toISOString(),
    status: params.image_url ? 'success' : 'pending',
    retry_count: 0,
    monthly_generation_count: 0,
    generation_month: new Date().toISOString().slice(0, 7) + '-01',
    image_url: params.image_url || null
  };
};

/**
 * Checks if a cache is still valid
 * @param cache The cache to check
 * @param lastFetchTime The last time the cache was updated
 * @param cacheTtl The cache time to live in milliseconds
 * @returns Whether the cache is still valid
 */
export const isCacheValid = (
  cache: ImageGenerationUsage[] | null,
  lastFetchTime: number,
  cacheTtl: number = DEFAULT_CACHE_TTL
): boolean => {
  return Boolean(cache && (Date.now() - lastFetchTime < cacheTtl));
};
