
import type { ImageGenerationUsage } from "@/types/saved-content";

export interface SaveImageParams {
  prompt: string;
  image_url?: string;
}

export interface UseImageContentOptions {
  cacheTime?: number;
  maxImages?: number;
}

export interface ImageContentState {
  isLoading: boolean;
  imageCache: ImageGenerationUsage[] | null;
  lastFetchTime: number;
  isFetchingImages: boolean;
  saveInProgress: boolean;
}
