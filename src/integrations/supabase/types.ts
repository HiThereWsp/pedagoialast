export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          action_type: string | null
          completion_status: boolean | null
          conversation_id: string | null
          conversation_title: string | null
          created_at: string | null
          deleted_at: string | null
          feedback_score: number | null
          id: number
          lesson_plan_data: Json | null
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          action_type?: string | null
          completion_status?: boolean | null
          conversation_id?: string | null
          conversation_title?: string | null
          created_at?: string | null
          deleted_at?: string | null
          feedback_score?: number | null
          id?: never
          lesson_plan_data?: Json | null
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string | null
          completion_status?: boolean | null
          conversation_id?: string | null
          conversation_title?: string | null
          created_at?: string | null
          deleted_at?: string | null
          feedback_score?: number | null
          id?: never
          lesson_plan_data?: Json | null
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tool_metrics: {
        Row: {
          id: string
          user_id: string
          tool_type: 'exercise' | 'lesson_plan' | 'correspondence'
          action_type: 'generate' | 'feedback' | 'share' | 'copy'
          content_length: number | null
          generation_time_ms: number | null
          feedback_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_type: 'exercise' | 'lesson_plan' | 'correspondence'
          action_type: 'generate' | 'feedback' | 'share' | 'copy'
          content_length?: number | null
          generation_time_ms?: number | null
          feedback_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_type?: 'exercise' | 'lesson_plan' | 'correspondence'
          action_type?: 'generate' | 'feedback' | 'share' | 'copy'
          content_length?: number | null
          generation_time_ms?: number | null
          feedback_score?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      conversation_analytics: {
        Row: {
          assistant_messages: number | null
          avg_satisfaction: number | null
          conversation_duration: number | null
          conversation_id: string | null
          day: string | null
          unique_actions: number | null
          user_id: string | null
          user_messages: number | null
        }
        Relationships: []
      }
      daily_usage_metrics: {
        Row: {
          avg_daily_satisfaction: number | null
          daily_active_users: number | null
          day: string | null
          productive_conversations: number | null
          total_conversations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_chat: {
        Args: {
          user_id: string
          message: string
        }
        Returns: undefined
      }
      generate_report: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_chats: {
        Args: {
          user_id: string
        }
        Returns: {
          id: number
          message: string
          created_at: string
        }[]
      }
      limit_chats_storage: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      send_email:
        | {
            Args: Record<PropertyKey, never>
            Returns: undefined
          }
        | {
            Args: {
              recipient: string
              subject: string
              body: string
            }
            Returns: undefined
          }
      send_password_reset_email: {
        Args: {
          email: string
        }
        Returns: undefined
      }
      test_send_email: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type ToolMetrics = Database["public"]["Tables"]["tool_metrics"]["Row"]
