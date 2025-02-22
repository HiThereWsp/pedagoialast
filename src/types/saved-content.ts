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
  tags: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}

export interface LessonPlanData {
  userId: string
  title: string
  subject: string
  level: string
  topic: string
  duration: number
  learningObjectives: string[]
  materials: string[]
  activities: string[]
  assessment: string
  differentiation: string
  notes: string
  type: 'lesson-plan'
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
  duration?: number
}

export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
  exercise_category?: 'standard' | 'differentiated'
  student_profile?: string
  learning_style?: string
  specific_needs?: string
}

export interface DatabaseTypes {
  Tables: {
    saved_lesson_plans: {
      Row: {
        id: string
        title: string
        content: string
        subject?: string
        class_level: string
        total_sessions?: number
        additional_instructions?: string
        created_at: string
        user_id: string
        duration?: number  // Ajout du champ duration
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
        class_level: string
        exercise_type?: string
        difficulty_level?: string
        created_at: string
        user_id: string
        exercise_category?: 'standard' | 'differentiated'
        student_profile?: string
        learning_style?: string
        specific_needs?: string
      }
      Insert: Omit<DatabaseTypes['Tables']['saved_exercises']['Row'], 'id' | 'created_at' | 'exercise_category' | 'student_profile' | 'learning_style' | 'specific_needs'> & {
        exercise_category?: 'standard' | 'differentiated'
        student_profile?: string
        learning_style?: string
        specific_needs?: string
      }
      Update: Partial<Omit<DatabaseTypes['Tables']['saved_exercises']['Insert'], 'user_id'>>
    }
    saved_correspondences: {
      Row: {
        id: string
        title: string
        content: string
        recipient_type: string
        tone?: string
        created_at: string
        user_id: string
      }
      Insert: Omit<DatabaseTypes['Tables']['saved_correspondences']['Row'], 'id' | 'created_at'>
      Update: Partial<DatabaseTypes['Tables']['saved_correspondences']['Insert']>
    }
  }
}

export interface ImageGenerationUsage {
  id: string;
  prompt: string;
  image_url?: string | null;
  user_id: string;
  generated_at: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error_message?: string;
  retry_count: number;
  last_retry?: string;
  monthly_generation_count?: number;
  generation_month?: string;
}
