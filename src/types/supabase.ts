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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
          tokens_used: number
          metadata: Json
        }
        Insert: {
          id?: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
          tokens_used?: number
          metadata?: Json
        }
        Update: {
          id?: string
          thread_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
          tokens_used?: number
          metadata?: Json
        }
      }
      chat_threads: {
        Row: {
          id: string
          user_id: string
          title: string
          preview: string
          created_at: string
          updated_at: string
          last_message_at: string
          status: 'active' | 'archived' | 'deleted'
          web_search_enabled: boolean
          deep_research_enabled: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          preview: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
          status?: 'active' | 'archived' | 'deleted'
          web_search_enabled?: boolean
          deep_research_enabled?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          preview?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
          status?: 'active' | 'archived' | 'deleted'
          web_search_enabled?: boolean
          deep_research_enabled?: boolean
          metadata?: Json
        }
      }
      chat_thread_tags: {
        Row: {
          thread_id: string
          tag: string
          created_at: string
        }
        Insert: {
          thread_id: string
          tag: string
          created_at?: string
        }
        Update: {
          thread_id?: string
          tag?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Helper type for the chat feature
export type Message = Database['public']['Tables']['chat_messages']['Row']
export type Thread = Database['public']['Tables']['chat_threads']['Row']
export type ThreadTag = Database['public']['Tables']['chat_thread_tags']['Row']
