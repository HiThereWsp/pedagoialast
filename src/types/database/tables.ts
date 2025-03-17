
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
  action_type: 'generate' | 'feedback' | 'share' | 'copy' | 'modify';
  content_length: number | null;
  generation_time_ms: number | null;
  feedback_score: number | null;
  content_id: string | null;
  comment: string | null;
  created_at: string;
}

export interface WaitlistRow {
  id: string;
  email: string;
  first_name: string;
  teaching_level: string;
  created_at: string;
}

export interface SuggestionVoteRow {
  id: string;
  user_id: string; // Can now be 'anonymous' or a user ID
  suggestion_id: string;
  created_at: string;
}

export interface PaymentEventRow {
  id: string;
  user_id: string;
  email: string;
  plan_type: 'monthly' | 'yearly' | 'school';
  event_type: 'payment_started' | 'payment_completed' | 'payment_failed';
  payment_method: 'stripe_direct' | 'stripe_checkout';
  promo_code?: string;
  created_at: string;
}

export interface UserSubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'inactive' | 'canceled';
  type: 'free' | 'paid' | 'trial' | 'beta';
  product_id?: string;
  promo_code?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Ajout de l'interface pour la table bug_reports
export interface BugReportRow {
  id: string;
  user_id: string | null;
  description: string;
  screenshot_url: string | null;
  browser_info: Json | null;
  url: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}
