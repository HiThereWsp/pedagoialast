
export interface SavedContent {
  id: string
  title: string
  content: string
  subject?: string
  class_level?: string
  created_at: string
  type: string
  source_type?: 'direct' | 'from_lesson_plan'
  source_lesson_plan_title?: string
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
}

export interface SaveLessonPlanParams extends SavedContent {
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

export interface HistoryItem extends SavedContent {
  tags: {
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }[]
}
