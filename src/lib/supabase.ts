import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://maplsndeuigjgzdubbpf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcGxzbmRldWlnamd6ZHViYnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjAzNDUsImV4cCI6MjA3MTc5NjM0NX0.PdrktLkKDs961bX1edrkkJIPk2CIC02YnQMXf-faYbA'

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
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
    }
  }
}
