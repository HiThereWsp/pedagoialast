
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

export interface ImageGenerationUsage {
  id: string;
  prompt: string;
  image_url: string | null;
  user_id: string;
  generated_at: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error_message?: string;
  retry_count: number;
  last_retry?: string;
  monthly_generation_count?: number;
  generation_month?: string;
}

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  questionsPerExercise: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  originalExercise: string;
  studentProfile: string;
  learningDifficulties: string;
  selectedLessonPlan: string;
  challenges: string[];
}

export interface SaveExerciseParams {
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
}

export interface SaveLessonPlanParams {
  title: string;
  content: string;
  subject?: string;
  class_level?: string;
}
