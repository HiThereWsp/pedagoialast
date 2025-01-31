import { Json } from './json';

export interface ChatRow {
  id: number;
  message: string;
  user_id: string;
  created_at: string | null;
  conversation_id: string | null;
  message_type: string | null;
  action_type: string | null;
  completion_status: boolean | null;
  feedback_score: number | null;
  conversation_title: string | null;
  deleted_at: string | null;
  lesson_plan_data: Json | null;
}

export interface ConversationContextRow {
  conversation_id: string;
  user_id: string;
  context: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  first_name: string;
  created_at: string;
}

export interface SessionMetricRow {
  id: string;
  conversation_id: string | null;
  user_id: string | null;
  session_start: string | null;
  session_end: string | null;
  total_messages: number | null;
  successful_actions: number | null;
  session_duration_seconds: number | null;
  created_at: string | null;
}

export interface ToolMetricRow {
  id: string;
  user_id: string;
  tool_type: 'exercise' | 'lesson_plan' | 'correspondence' | 'image_generation';
  action_type: 'generate' | 'feedback' | 'share' | 'copy';
  content_length: number | null;
  generation_time_ms: number | null;
  feedback_score: number | null;
  created_at: string;
}

export interface WaitlistRow {
  id: string;
  email: string;
  first_name: string;
  teaching_level: string;
  created_at: string;
}