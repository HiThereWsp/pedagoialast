
import { useState } from 'react';
import { useSaveImage } from './useSaveImage';
import { useGetSavedImages } from './useGetSavedImages';
import { useRetryFailedImage } from './useRetryFailedImage';
import type { UseImageContentOptions } from './types';

/**
 * Main hook for image content management
 * @param options Configuration options
 * @returns Functions and state for image content management
 */
export function useImageContent(options?: UseImageContentOptions) {
  const { saveImage } = useSaveImage();
  const { isLoading, getSavedImages, invalidateCache, cleanup } = useGetSavedImages();
  const { retryFailedImage } = useRetryFailedImage();

  return {
    isLoading,
    saveImage,
    getSavedImages,
    retryFailedImage,
    invalidateCache,
    cleanup
  };
}
