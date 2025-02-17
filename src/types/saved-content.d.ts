
export interface SavedContent {
  id: string;
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
  created_at: string;
  type: 'exercise' | 'lesson_plan' | 'image';
  source_type?: 'direct' | 'from_lesson_plan';
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
