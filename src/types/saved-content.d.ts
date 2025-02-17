
export type ContentType = 'exercise' | 'lesson_plan' | 'image';

export interface SavedContent {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  subject?: string;
  class_level?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  source_type?: 'direct' | 'from_lesson_plan';
  source_lesson_plan_id?: string;
  source_lesson_plan_title?: string;
  exercise_type?: string;
  total_sessions?: number;
  difficulty_level?: string;
  additional_instructions?: string;
  user_id?: string;
}

export interface HistoryItem extends SavedContent {
  tags: Array<{
    label: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }>;
}
