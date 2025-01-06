export type ToolMetrics = {
  id: string
  user_id: string
  tool_type: 'exercise' | 'lesson_plan' | 'correspondence'
  action_type: 'generate' | 'feedback' | 'share' | 'copy'
  content_length?: number
  generation_time_ms?: number
  feedback_score?: -1 | 1
  created_at: string
}