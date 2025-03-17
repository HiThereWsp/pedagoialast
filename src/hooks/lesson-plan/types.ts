
// Storage keys for form data and results
export const FORM_STORAGE_KEY = 'lesson_plan_form_data';
export const RESULT_STORAGE_KEY = 'lesson_plan_result_data';

export interface LessonPlanFormData {
  classLevel: string;
  additionalInstructions: string;
  totalSessions: string;
  subject: string;
  subject_matter: string;
  text: string;
  lessonPlan: string;
}

export interface SaveLessonPlanParams {
  title: string;
  content: string;
  subject: string;
  subject_matter: string;
  class_level: string;
  total_sessions: number;
  additional_instructions: string;
}
