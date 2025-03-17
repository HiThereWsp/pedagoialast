
import { useState } from 'react';

export type GenerationStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface ImageGenerationState {
  status: GenerationStatus;
  error: string | null;
  imageUrl: string | null;
  lastPrompt: {
    prompt: string;
    style?: string;
  } | null;
  retryCount: number;
  isInitialized: boolean;
}

const initialState: ImageGenerationState = {
  status: 'IDLE',
  error: null,
  imageUrl: null,
  lastPrompt: null,
  retryCount: 0,
  isInitialized: false
};

export function useImageGenerationState() {
  const [state, setState] = useState<ImageGenerationState>(initialState);

  const setLoading = () => {
    setState(prev => ({
      ...prev,
      status: 'LOADING',
      error: null,
      isInitialized: true
    }));
  };

  const setSuccess = (imageUrl: string, prompt: string, style?: string) => {
    setState(prev => ({
      ...prev,
      status: 'SUCCESS',
      imageUrl,
      lastPrompt: { prompt, style },
      error: null,
      retryCount: 0,
      isInitialized: true
    }));
  };

  const setError = (errorMessage: string) => {
    setState(prev => ({
      ...prev,
      status: 'ERROR',
      error: errorMessage,
      isInitialized: true
    }));
  };

  const resetState = () => {
    setState(initialState);
  };

  const incrementRetry = () => {
    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1
    }));
  };

  return {
    state,
    setLoading,
    setSuccess,
    setError,
    resetState,
    incrementRetry
  };
}
