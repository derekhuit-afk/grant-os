import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          org_name: string | null
          org_type: 'nonprofit' | 'school_district' | 'government' | null
          ein: string | null
          uei: string | null
          sam_gov_active: boolean
          onboarding_complete: boolean
          subscription_status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled'
          subscription_tier: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      grants: {
        Row: {
          id: string
          user_id: string
          title: string
          funder: string
          amount: number | null
          deadline: string | null
          status: 'research' | 'drafting' | 'submitted' | 'awarded' | 'rejected'
          program_type: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['grants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['grants']['Insert']>
      }
      attestation_logs: {
        Row: {
          id: string
          user_id: string
          org_name: string
          content_type: string
          grant_id: string | null
          ip_hash: string | null
          attested_at: string
          items_confirmed: string[]
        }
        Insert: Omit<Database['public']['Tables']['attestation_logs']['Row'], 'id' | 'attested_at'>
        Update: never
      }
      narratives: {
        Row: {
          id: string
          user_id: string
          grant_id: string | null
          narrative_type: string
          prompt_input: string
          generated_content: string
          attested: boolean
          attestation_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['narratives']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['narratives']['Insert']>
      }
    }
  }
}

// Client-side Supabase client
export const createBrowserClient = () =>
  createClientComponentClient<Database>()

// Server-side Supabase client — import from lib/supabase-server.ts in Server Components
// Do NOT import createServerClient here — next/headers cannot be bundled with client code

// Service role client (API routes only — never expose to client)
export const createServiceClient = () =>
  createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
