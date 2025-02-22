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

export interface ImageGenerationUsage {
  id: string
  prompt: string
  image_url: string | null
  user_id: string
  generated_at: string
  status: 'pending' | 'processing' | 'success' | 'error'
  error_message?: string
  retry_count: number
  last_retry?: string
  monthly_generation_count?: number
  generation_month?: string
}

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
  challenges: string[]
}

export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
  source_lesson_plan_id?: string
  source_type?: 'direct' | 'from_lesson_plan'
  exercise_category?: 'standard' | 'differentiated'
}

export interface SaveLessonPlanParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  total_sessions?: number
  additional_instructions?: string
}

export interface ExtractedExercise {
  title: string
  content: string
  subject?: string
  class_level?: string
  lesson_plan_id: string
}