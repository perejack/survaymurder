import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://maplsndeuigjgzdubbpf.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcGxzbmRldWlnamd6ZHViYnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjAzNDUsImV4cCI6MjA3MTc5NjM0NX0.PdrktLkKDs961bX1edrkkJIPk2CIC02YnQMXf-faYbA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string | null
          avatar_url: string | null
          account_activated: boolean
          is_platinum: boolean
          activation_date: string | null
          platinum_upgrade_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          account_activated?: boolean
          is_platinum?: boolean
          activation_date?: string | null
          platinum_upgrade_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          account_activated?: boolean
          is_platinum?: boolean
          activation_date?: string | null
          platinum_upgrade_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          title: string
          description: string | null
          reward_amount: number
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          reward_amount?: number
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          reward_amount?: number
          created_at?: string
          is_active?: boolean
        }
      }
      user_survey_responses: {
        Row: {
          id: string
          user_id: string
          survey_id: string
          responses: any
          completed_at: string
          reward_earned: number
        }
        Insert: {
          id?: string
          user_id: string
          survey_id: string
          responses?: any
          completed_at?: string
          reward_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          survey_id?: string
          responses?: any
          completed_at?: string
          reward_earned?: number
        }
      }
      daily_survey_completions: {
        Row: {
          id: string
          user_id: string
          completion_date: string
          surveys_completed: number
          daily_limit: number
          task_packages_purchased: number
          additional_surveys_unlocked: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completion_date?: string
          surveys_completed?: number
          daily_limit?: number
          task_packages_purchased?: number
          additional_surveys_unlocked?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completion_date?: string
          surveys_completed?: number
          daily_limit?: number
          task_packages_purchased?: number
          additional_surveys_unlocked?: number
          created_at?: string
          updated_at?: string
        }
      }
      earning_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      get_daily_survey_status: {
        Args: { user_uuid: string }
        Returns: {
          surveys_completed: number
          daily_limit: number
          can_complete_survey: boolean
          is_account_activated: boolean
          is_platinum_user: boolean
        }[]
      }
      complete_survey: {
        Args: { user_uuid: string; survey_category?: string }
        Returns: {
          success: boolean
          surveys_completed: number
          daily_limit: number
          show_task_limit_modal: boolean
          message: string
        }[]
      }
      activate_user_account: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      upgrade_to_platinum: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      purchase_task_package: {
        Args: { user_uuid: string; package_type: string }
        Returns: boolean
      }
      get_current_user_balance: {
        Args: {}
        Returns: number
      }
    }
  }
}
