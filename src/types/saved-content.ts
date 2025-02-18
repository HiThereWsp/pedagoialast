
export interface SavedContent {
  id: string
  title: string
  content: string
  subject?: string
  class_level?: string
  created_at: string
  type: 'lesson-plan' | 'exercise' | 'Image'
  tags: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}

export interface SaveLessonPlanParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  total_sessions?: number
  additional_instructions?: string
}

export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
}

export interface DatabaseTypes {
  Tables: {
    saved_lesson_plans: {
      Row: {
        id: string
        title: string
        content: string
        subject?: string
        class_level?: string
        total_sessions?: number
        additional_instructions?: string
        created_at: string
        user_id: string
      }
      Insert: Omit<DatabaseTypes['Tables']['saved_lesson_plans']['Row'], 'id' | 'created_at'>
      Update: Partial<DatabaseTypes['Tables']['saved_lesson_plans']['Insert']>
    }
    saved_exercises: {
      Row: {
        id: string
        title: string
        content: string
        subject?: string
        class_level?: string
        exercise_type?: string
        difficulty_level?: string
        created_at: string
        user_id: string
      }
      Insert: Omit<DatabaseTypes['Tables']['saved_exercises']['Row'], 'id' | 'created_at'>
      Update: Partial<DatabaseTypes['Tables']['saved_exercises']['Insert']>
    }
  }
}
