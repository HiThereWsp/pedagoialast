
export interface GenerationPrompt {
  prompt: string;
  style?: string;
  user_prompt?: string;
  context?: string;
}

export interface ImageStyle {
  id: string;
  name: string;
  example: string;
}

export interface UseImageGenerationResult {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isInitialized: boolean;
  error: string | null;
  generatedImageUrl: string | null;
  lastPrompt: {
    prompt: string;
    style?: string;
  } | null;
  generateImage: (prompt: GenerationPrompt) => Promise<void>;
  retryGeneration: () => Promise<void>;
}

export interface ContentScreeningResult {
  isInappropriate: boolean;
  reason?: string;
}
