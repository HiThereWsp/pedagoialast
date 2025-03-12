
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
  generatedImageUrl: string | null;
  generateImage: (prompt: GenerationPrompt) => Promise<void>;
}

export interface ContentScreeningResult {
  isInappropriate: boolean;
  reason?: string;
}
