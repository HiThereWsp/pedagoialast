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

// Types pour les exercices
export type ExerciseCategory = 'standard' | 'differentiated';

// Interface pour la sauvegarde des exercices
export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  source_lesson_plan_id?: string
  exercise_category?: ExerciseCategory
  source_type?: 'direct' | 'from_lesson_plan'  // Ajout du champ manquant
}

// Interface pour les exercices extraits
export interface ExtractedExercise {
  title: string
  content: string
  subject?: string
  class_level?: string
  lesson_plan_id: string
}

// Interface pour le formulaire d'exercice
export interface ExerciseFormData {
  subject: string
  classLevel: string
  numberOfExercises: string
  questionsPerExercise: string
  objective: string
  exerciseType: string
  additionalInstructions: string
  specificNeeds: string
  originalExercise: string
  studentProfile: string
  learningDifficulties: string
  selectedLessonPlan: string
  challenges: string
}

// Interface pour la sauvegarde des plans de leçon
export interface SaveLessonPlanParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  total_sessions?: number
  additional_instructions?: string
}

// Types pour la gestion des images
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
