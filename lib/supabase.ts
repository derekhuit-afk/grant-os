import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; email: string; org_name: string | null
          org_type: 'nonprofit' | 'school_district' | 'government' | null
          ein: string | null; uei: string | null; sam_gov_active: boolean
          onboarding_complete: boolean; subscription_status: string
          subscription_tier: string | null; stripe_customer_id: string | null
          stripe_subscription_id: string | null; single_audit_required: boolean
          federal_expenditures_last_fy: number | null; state: string | null
          city: string | null; website: string | null
          created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      grants: {
        Row: {
          id: string; user_id: string; title: string; funder: string
          amount: number | null; deadline: string | null; award_amount: number | null
          status: string; notes: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['grants']['Row']>
        Update: Partial<Database['public']['Tables']['grants']['Row']>
      }
      attestation_logs: {
        Row: {
          id: string; user_id: string; org_name: string; email: string
          content_type: string; items_confirmed: string[]; attested_at: string
        }
        Insert: Partial<Database['public']['Tables']['attestation_logs']['Row']>
        Update: never
      }
      narratives: {
        Row: {
          id: string; user_id: string; narrative_type: string
          prompt_input: string; generated_content: string
          attested: boolean; created_at: string
        }
        Insert: Partial<Database['public']['Tables']['narratives']['Row']>
        Update: Partial<Database['public']['Tables']['narratives']['Row']>
      }
      compliance_events: {
        Row: {
          id: string; user_id: string; title: string
          due_date: string; status: string; created_at: string
        }
        Insert: Partial<Database['public']['Tables']['compliance_events']['Row']>
        Update: Partial<Database['public']['Tables']['compliance_events']['Row']>
      }
    }
  }
}

// Client-side (use client components)
export const createBrowserSupabaseClient = () =>
  createSSRBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Alias used throughout the app
export const createBrowserClient_compat = createBrowserSupabaseClient

// Server-side (Server Components, Route Handlers)
export const createServerClient = () => {
  const cookieStore = cookies()
  return createSSRServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}

// Service role — API routes only, never client
export const createServiceClient = () =>
  createClient<Database>(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

// Wrapper for client components — called with no args throughout the app
export const createBrowserClient = () =>
  createBrowserSupabaseClient()
