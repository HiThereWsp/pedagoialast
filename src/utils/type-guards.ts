
import type { ImageGenerationUsage, BaseImageValidation, ExerciseCategory } from "@/types/saved-content";

export function isExerciseCategory(value: unknown): value is ExerciseCategory {
  return value === 'standard' || value === 'differentiated';
}

export function isBaseImageValidation(data: unknown): data is BaseImageValidation {
  if (!data || typeof data !== 'object') return false;
  
  const img = data as any;
  return (
    typeof img.id === 'string' &&
    typeof img.prompt === 'string' &&
    (img.image_url === null || typeof img.image_url === 'string') &&
    typeof img.user_id === 'string' &&
    typeof img.generated_at === 'string' &&
    ['pending', 'processing', 'success', 'error'].includes(img.status) &&
    typeof img.retry_count === 'number' &&
    typeof img.monthly_generation_count === 'number' &&
    typeof img.generation_month === 'string'
  );
}

export function isImageGenerationUsage(data: unknown): data is ImageGenerationUsage {
  if (!isBaseImageValidation(data)) return false;
  
  const img = data as any;
  if (img.error_message !== undefined && typeof img.error_message !== 'string') return false;
  if (img.last_retry !== undefined && typeof img.last_retry !== 'string') return false;
  
  return true;
}
