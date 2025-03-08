
import type { ImageGenerationUsage, BaseImageValidation, ExerciseCategory } from "@/types/saved-content";

export function isExerciseCategory(value: unknown): value is ExerciseCategory {
  return value === 'standard' || value === 'differentiated';
}

export function isBaseImageValidation(data: unknown): data is BaseImageValidation {
  if (!data || typeof data !== 'object') return false;
  
  const img = data as any;
  
  // Validation minimale des champs requis
  const hasRequiredFields = 
    typeof img.id === 'string' &&
    typeof img.prompt === 'string' &&
    (img.image_url === null || typeof img.image_url === 'string') &&
    typeof img.user_id === 'string' &&
    typeof img.generated_at === 'string' &&
    typeof img.status === 'string';
  
  if (!hasRequiredFields) return false;
  
  // Valider les autres champs si présents mais avec plus de souplesse
  if (img.retry_count !== undefined && typeof img.retry_count !== 'number') return false;
  if (img.monthly_generation_count !== undefined && typeof img.monthly_generation_count !== 'number') return false;
  if (img.generation_month !== undefined && typeof img.generation_month !== 'string') return false;
  
  return true;
}

export function isImageGenerationUsage(data: unknown): data is ImageGenerationUsage {
  if (!isBaseImageValidation(data)) return false;
  
  const img = data as any;
  
  // Valider les champs optionnels uniquement s'ils sont présents
  if (img.error_message !== undefined && typeof img.error_message !== 'string') return false;
  if (img.last_retry !== undefined && typeof img.last_retry !== 'string') return false;
  
  return true;
}
