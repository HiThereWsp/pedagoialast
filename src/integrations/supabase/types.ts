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
      ambassador_program: {
        Row: {
          approved_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string | null
          id: string
          notes: string | null
          requested_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backup_saved_exercises: {
        Row: {
          class_level: string | null
          content: string | null
          created_at: string | null
          difficulty_level: string | null
          exercise_type: string | null
          id: string | null
          subject: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          class_level?: string | null
          content?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          exercise_type?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          class_level?: string | null
          content?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          exercise_type?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_saved_lesson_plans: {
        Row: {
          additional_instructions: string | null
          class_level: string | null
          content: string | null
          created_at: string | null
          id: string | null
          subject: string | null
          title: string | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_instructions?: string | null
          class_level?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_instructions?: string | null
          class_level?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      beta_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_validated: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_validated?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_validated?: boolean
        }
        Relationships: []
      }
      beta_welcome_messages: {
        Row: {
          created_at: string | null
          id: string
          message_sent: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_sent?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_sent?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      bug_reports: {
        Row: {
          browser_info: Json | null
          created_at: string
          description: string
          Email: string | null
          id: string
          screenshot_url: string | null
          status: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          description: string
          Email?: string | null
          id?: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          description?: string
          Email?: string | null
          id?: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          action_type: string | null
          attachments: Json | null
          completion_status: boolean | null
          conversation_id: string | null
          conversation_title: string | null
          created_at: string
          deleted_at: string | null
          feedback_score: number | null
          feedback_type: Database["public"]["Enums"]["feedback_type"] | null
          id: number
          lesson_plan_data: Json | null
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          action_type?: string | null
          attachments?: Json | null
          completion_status?: boolean | null
          conversation_id?: string | null
          conversation_title?: string | null
          created_at?: string
          deleted_at?: string | null
          feedback_score?: number | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"] | null
          id?: never
          lesson_plan_data?: Json | null
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string | null
          attachments?: Json | null
          completion_status?: boolean | null
          conversation_id?: string | null
          conversation_title?: string | null
          created_at?: string
          deleted_at?: string | null
          feedback_score?: number | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"] | null
          id?: never
          lesson_plan_data?: Json | null
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_contexts: {
        Row: {
          context: string
          conversation_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string
          conversation_id: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string
          conversation_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      differentiated_exercises: {
        Row: {
          adapted_exercise: string
          class_level: string
          created_at: string
          id: string
          learning_style: string | null
          objective: string
          original_exercise: string | null
          specific_needs: string | null
          student_profile: string
          subject: string
          user_id: string
        }
        Insert: {
          adapted_exercise: string
          class_level: string
          created_at?: string
          id?: string
          learning_style?: string | null
          objective: string
          original_exercise?: string | null
          specific_needs?: string | null
          student_profile: string
          subject: string
          user_id: string
        }
        Update: {
          adapted_exercise?: string
          class_level?: string
          created_at?: string
          id?: string
          learning_style?: string | null
          objective?: string
          original_exercise?: string | null
          specific_needs?: string | null
          student_profile?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      friction_points: {
        Row: {
          action_completed_at: string | null
          action_started_at: string | null
          created_at: string | null
          error_occurred: boolean | null
          id: string
          regeneration_count: number | null
          tool_type: string
          user_id: string | null
          wait_duration_ms: number | null
          was_abandoned: boolean | null
        }
        Insert: {
          action_completed_at?: string | null
          action_started_at?: string | null
          created_at?: string | null
          error_occurred?: boolean | null
          id?: string
          regeneration_count?: number | null
          tool_type: string
          user_id?: string | null
          wait_duration_ms?: number | null
          was_abandoned?: boolean | null
        }
        Update: {
          action_completed_at?: string | null
          action_started_at?: string | null
          created_at?: string | null
          error_occurred?: boolean | null
          id?: string
          regeneration_count?: number | null
          tool_type?: string
          user_id?: string | null
          wait_duration_ms?: number | null
          was_abandoned?: boolean | null
        }
        Relationships: []
      }
      image_generation_usage: {
        Row: {
          error_message: string | null
          generated_at: string | null
          generation_month: string | null
          id: string
          image_url: string | null
          last_retry: string | null
          monthly_generation_count: number | null
          prompt: string
          retry_count: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          error_message?: string | null
          generated_at?: string | null
          generation_month?: string | null
          id?: string
          image_url?: string | null
          last_retry?: string | null
          monthly_generation_count?: number | null
          prompt: string
          retry_count?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          error_message?: string | null
          generated_at?: string | null
          generation_month?: string | null
          id?: string
          image_url?: string | null
          last_retry?: string | null
          monthly_generation_count?: number | null
          prompt?: string
          retry_count?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_plan_cache: {
        Row: {
          additional_instructions: string | null
          cache_key: string | null
          class_level: string
          created_at: string
          id: string
          lesson_plan: string
          subject: string | null
          text: string | null
          total_sessions: number
          usage_count: number | null
        }
        Insert: {
          additional_instructions?: string | null
          cache_key?: string | null
          class_level: string
          created_at?: string
          id?: string
          lesson_plan: string
          subject?: string | null
          text?: string | null
          total_sessions: number
          usage_count?: number | null
        }
        Update: {
          additional_instructions?: string | null
          cache_key?: string | null
          class_level?: string
          created_at?: string
          id?: string
          lesson_plan?: string
          subject?: string | null
          text?: string | null
          total_sessions?: number
          usage_count?: number | null
        }
        Relationships: []
      }
      pdf_documents: {
        Row: {
          created_at: string
          file_path: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pdf_embeddings: {
        Row: {
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          page_number: number
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          page_number: number
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdf_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      perplexica_conversations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      perplexica_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
          search_results: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          search_results?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          search_results?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perplexica_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "perplexica_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
        }
        Relationships: []
      }
      redirect_logs: {
        Row: {
          clicked_at: string | null
          id: string
          ip_address: string | null
          redirect_id: string | null
          referer: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          redirect_id?: string | null
          referer?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          redirect_id?: string | null
          referer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redirect_logs_redirect_id_fkey"
            columns: ["redirect_id"]
            isOneToOne: false
            referencedRelation: "url_redirects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_correspondences: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipient_type: string
          title: string
          tone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipient_type: string
          title: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipient_type?: string
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_exercises: {
        Row: {
          class_level: string | null
          content: string
          created_at: string
          difficulty_level: string | null
          exercise_category: string | null
          exercise_type: string | null
          id: string
          learning_style: string | null
          source_lesson_plan_id: string | null
          source_type: string | null
          specific_needs: string | null
          student_profile: string | null
          subject: string | null
          subject_matter: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_level?: string | null
          content: string
          created_at?: string
          difficulty_level?: string | null
          exercise_category?: string | null
          exercise_type?: string | null
          id?: string
          learning_style?: string | null
          source_lesson_plan_id?: string | null
          source_type?: string | null
          specific_needs?: string | null
          student_profile?: string | null
          subject?: string | null
          subject_matter?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_level?: string | null
          content?: string
          created_at?: string
          difficulty_level?: string | null
          exercise_category?: string | null
          exercise_type?: string | null
          id?: string
          learning_style?: string | null
          source_lesson_plan_id?: string | null
          source_type?: string | null
          specific_needs?: string | null
          student_profile?: string | null
          subject?: string | null
          subject_matter?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_exercises_source_lesson_plan_id_fkey"
            columns: ["source_lesson_plan_id"]
            isOneToOne: false
            referencedRelation: "saved_lesson_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_lesson_plans: {
        Row: {
          additional_instructions: string | null
          class_level: string | null
          content: string
          created_at: string
          id: string
          subject: string | null
          subject_matter: string | null
          title: string
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_instructions?: string | null
          class_level?: string | null
          content: string
          created_at?: string
          id?: string
          subject?: string | null
          subject_matter?: string | null
          title: string
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_instructions?: string | null
          class_level?: string | null
          content?: string
          created_at?: string
          id?: string
          subject?: string | null
          subject_matter?: string | null
          title?: string
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_metrics: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          session_duration_seconds: number | null
          session_end: string | null
          session_start: string | null
          successful_actions: number | null
          total_messages: number | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          session_duration_seconds?: number | null
          session_end?: string | null
          session_start?: string | null
          successful_actions?: number | null
          total_messages?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          session_duration_seconds?: number | null
          session_end?: string | null
          session_start?: string | null
          successful_actions?: number | null
          total_messages?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      suggestion_votes: {
        Row: {
          created_at: string | null
          id: string
          suggestion_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          suggestion_id: string
          user_id: string
          vote_type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          suggestion_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          author: string
          author_id: string | null
          created_at: string | null
          description: string
          id: string
          status: string
          title: string
          votes: number
        }
        Insert: {
          author: string
          author_id?: string | null
          created_at?: string | null
          description: string
          id: string
          status?: string
          title: string
          votes?: number
        }
        Update: {
          author?: string
          author_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          votes?: number
        }
        Relationships: []
      }
      tool_metrics: {
        Row: {
          action_type: string
          comment: string | null
          content_id: string | null
          content_length: number | null
          created_at: string
          feedback_score: number | null
          generation_time_ms: number | null
          id: string
          tool_type: string
          user_id: string
        }
        Insert: {
          action_type: string
          comment?: string | null
          content_id?: string | null
          content_length?: number | null
          created_at?: string
          feedback_score?: number | null
          generation_time_ms?: number | null
          id?: string
          tool_type: string
          user_id: string
        }
        Update: {
          action_type?: string
          comment?: string | null
          content_id?: string | null
          content_length?: number | null
          created_at?: string
          feedback_score?: number | null
          generation_time_ms?: number | null
          id?: string
          tool_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_prompts: {
        Row: {
          created_at: string
          id: string
          name: string
          system_prompt: string
          tool_type: Database["public"]["Enums"]["tool_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          system_prompt: string
          tool_type: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          system_prompt?: string
          tool_type?: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
        }
        Relationships: []
      }
      url_redirects: {
        Row: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          last_clicked_at: string | null
          short_path: string
          target_url: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_clicked_at?: string | null
          short_path: string
          target_url: string
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_clicked_at?: string | null
          short_path?: string
          target_url?: string
        }
        Relationships: []
      }
      usage_patterns: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          feature_complexity: string | null
          hour_of_day: number | null
          id: string
          is_template_used: boolean | null
          session_end: string | null
          session_start: string | null
          tool_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          feature_complexity?: string | null
          hour_of_day?: number | null
          id?: string
          is_template_used?: boolean | null
          session_end?: string | null
          session_start?: string | null
          tool_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          feature_complexity?: string | null
          hour_of_day?: number | null
          id?: string
          is_template_used?: boolean | null
          session_end?: string | null
          session_start?: string | null
          tool_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_popup_views: {
        Row: {
          id: string
          popup_key: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          popup_key: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          popup_key?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email_verified: boolean | null
          id: number
          is_admin: boolean | null
          is_ambassador: boolean | null
          is_beta: boolean | null
          is_paid_user: boolean | null
          onboarding_completed: boolean | null
          onboarding_tasks: boolean[] | null
          role_expiry: string | null
          stripe_customer_id: string | null
          user_email: string | null
          user_id: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          created_at?: string
          email_verified?: boolean | null
          id?: number
          is_admin?: boolean | null
          is_ambassador?: boolean | null
          is_beta?: boolean | null
          is_paid_user?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_tasks?: boolean[] | null
          role_expiry?: string | null
          stripe_customer_id?: string | null
          user_email?: string | null
          user_id?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          created_at?: string
          email_verified?: boolean | null
          id?: number
          is_admin?: boolean | null
          is_ambassador?: boolean | null
          is_beta?: boolean | null
          is_paid_user?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_tasks?: boolean[] | null
          role_expiry?: string | null
          stripe_customer_id?: string | null
          user_email?: string | null
          user_id?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      user_retention: {
        Row: {
          created_at: string | null
          days_active: number[] | null
          first_seen_date: string
          id: string
          last_seen_date: string
          retention_30_days: boolean | null
          retention_7_days: boolean | null
          retention_90_days: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_active?: number[] | null
          first_seen_date: string
          id?: string
          last_seen_date: string
          retention_30_days?: boolean | null
          retention_7_days?: boolean | null
          retention_90_days?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_active?: number[] | null
          first_seen_date?: string
          id?: string
          last_seen_date?: string
          retention_30_days?: boolean | null
          retention_7_days?: boolean | null
          retention_90_days?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          expires_at: string
          id: string
          plan_variant: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          expires_at: string
          id?: string
          plan_variant?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          expires_at?: string
          id?: string
          plan_variant?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      utm_links: {
        Row: {
          base_url: string
          created_at: string
          id: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          base_url: string
          created_at?: string
          id?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          base_url?: string
          created_at?: string
          id?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          teaching_level: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          teaching_level: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          teaching_level?: string
        }
        Relationships: []
      }
      welcome_emails: {
        Row: {
          created_at: string | null
          email: string
          error: string | null
          first_name: string | null
          id: string
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          error?: string | null
          first_name?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          error?: string | null
          first_name?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      dau_mau_ratio: {
        Row: {
          dau: number | null
          dau_mau_ratio: number | null
          mau: number | null
          month: string | null
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
      add_user_to_profiles: {
        Args: {
          user_id: string
          user_email: string
        }
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      call_expire_user_role: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_ambassador_status: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      delete_url_redirect: {
        Args: {
          p_id: string
        }
        Returns: undefined
      }
      generate_report: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_bug_report_with_user_details: {
        Args: {
          report_id: string
        }
        Returns: {
          id: string
          user_id: string
          description: string
          screenshot_url: string
          browser_info: Json
          url: string
          status: string
          created_at: string
          updated_at: string
          user_email: string
        }[]
      }
      get_redirect_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          clicked_at: string | null
          id: string
          ip_address: string | null
          redirect_id: string | null
          referer: string | null
          user_agent: string | null
        }[]
      }
      get_url_redirect_by_path: {
        Args: {
          p_short_path: string
        }
        Returns: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          last_clicked_at: string | null
          short_path: string
          target_url: string
        }
      }
      get_url_redirects: {
        Args: Record<PropertyKey, never>
        Returns: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          last_clicked_at: string | null
          short_path: string
          target_url: string
        }[]
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
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      has_active_subscription: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      insert_url_redirect: {
        Args: {
          p_short_path: string
          p_target_url: string
          p_description: string
        }
        Returns: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          last_clicked_at: string | null
          short_path: string
          target_url: string
        }
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      limit_chats_storage: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      log_redirect_click: {
        Args: {
          p_redirect_id: string
          p_user_agent: string
          p_referer: string
          p_ip_address: string
        }
        Returns: undefined
      }
      migrate_existing_users_to_beta: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      update_url_redirect: {
        Args: {
          p_id: string
          p_short_path: string
          p_target_url: string
          p_description: string
        }
        Returns: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          last_clicked_at: string | null
          short_path: string
          target_url: string
        }
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
      feedback_type: "like" | "dislike"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
      subscription_type: "beta" | "trial" | "paid" | "ambassador"
      tool_type:
        | "differentiation"
        | "sequence"
        | "administrative"
        | "general"
        | "image_generation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
