
import { GenerationPrompt } from "@/components/image-generation/types";

export interface UseImageGenerationResult {
  isLoading: boolean;
  generatedImageUrl: string | null;
  generateImage: (generationPrompt: GenerationPrompt) => Promise<void>;
}

export interface ContentScreeningResult {
  isInappropriate: boolean;
  reason?: string;
}
