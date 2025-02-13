
export interface SavedContent {
  id: string
  title: string
  content: string
  subject?: string
  class_level?: string
  created_at: string
  type: string
}

export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
}

export interface SaveLessonPlanParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  total_sessions?: number
  additional_instructions?: string
}

