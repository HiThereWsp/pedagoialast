export interface ConversationAnalyticsRow {
  day: string | null;
  user_id: string | null;
  conversation_id: string | null;
  user_messages: number | null;
  assistant_messages: number | null;
  unique_actions: number | null;
  avg_satisfaction: number | null;
  conversation_duration: number | null;
}

export interface DailyUsageMetricsRow {
  day: string | null;
  daily_active_users: number | null;
  total_conversations: number | null;
  productive_conversations: number | null;
  avg_daily_satisfaction: number | null;
}