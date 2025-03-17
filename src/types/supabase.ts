
export type ToolMetrics = {
  id: string
  user_id: string
  tool_type: 'exercise' | 'lesson_plan' | 'correspondence' | 'image_generation'
  action_type: 'generate' | 'feedback' | 'share' | 'copy' | 'modify'
  content_length?: number
  generation_time_ms?: number
  feedback_score?: -1 | 1
  content_id?: string
  comment?: string
  created_at: string
}
