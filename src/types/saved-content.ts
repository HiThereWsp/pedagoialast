
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
  tags?: Array<{
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

export interface SaveExerciseParams {
  title: string
  content: string
  subject?: string
  class_level?: string
  exercise_type?: string
  difficulty_level?: string
  tags?: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}
