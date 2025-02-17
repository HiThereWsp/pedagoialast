
export type ContentType = 'exercise' | 'lesson_plan' | 'image';
export type SourceType = 'direct' | 'from_lesson_plan';

export interface SavedContent {
  id: string;
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
  created_at: string;
  type: ContentType;
  source_type?: SourceType;
  source_lesson_plan_title?: string;
  exercise_type?: string;
  difficulty_level?: string;
  description?: string;
  user_id?: string;
  source_lesson_plan_id?: string;
  updated_at?: string;
  total_sessions?: number;
  additional_instructions?: string;
}

export interface HistoryItem extends SavedContent {
  tags: {
    label: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }[];
}

export interface SaveExerciseParams {
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
  exercise_type?: string;
  difficulty_level?: string;
  source_lesson_plan_id?: string;
  source_type?: SourceType;
}

export interface SaveLessonPlanParams {
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
  total_sessions?: number;
  additional_instructions?: string;
}

export interface ExtractedExercise {
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
  lesson_plan_id: string;
}
