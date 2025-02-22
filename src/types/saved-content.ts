export interface SavedContent {
  id: string
  title: string
  content: string
  subject?: string
  subject_matter?: string
  class_level?: string
  created_at: string
  type: 'lesson-plan' | 'exercise' | 'Image' | 'correspondence'
  displayType?: string
  exercise_category?: 'standard' | 'differentiated'
  source_type?: 'direct' | 'from_lesson_plan'
  source_lesson_plan_title?: string
  source_lesson_plan_id?: string
  updated_at?: string
  total_sessions?: number
  additional_instructions?: string
  exercise_type?: string
  difficulty_level?: string
  tags: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}

// Types stricts pour les exercices
export type ExerciseCategory = 'standard' | 'differentiated';
export type ImageStatus = 'pending' | 'processing' | 'success' | 'error';

// Interface de base pour la validation des images
export interface BaseImageValidation {
  id: string
  prompt: string
  image_url: string | null
  user_id: string
  generated_at: string
  status: ImageStatus
  retry_count: number
  monthly_generation_count: number
  generation_month: string
}

// Champs optionnels pour les images
export interface OptionalImageFields {
  error_message?: string
  last_retry?: string
}

// Type final pour ImageGenerationUsage
export type ImageGenerationUsage = BaseImageValidation & OptionalImageFields;
