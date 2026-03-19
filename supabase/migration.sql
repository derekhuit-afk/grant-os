-- ============================================================
-- GRANT OS — SUPABASE DATABASE MIGRATION
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run in order. Do not skip sections.
-- ============================================================

-- ── ENABLE EXTENSIONS ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  org_name TEXT,
  org_type TEXT CHECK (org_type IN ('nonprofit', 'school_district', 'government')),
  ein TEXT,
  uei TEXT,
  ntee_code TEXT,
  state TEXT,
  city TEXT,
  website TEXT,
  sam_gov_active BOOLEAN DEFAULT FALSE,
  sam_gov_expiry DATE,
  federal_expenditures_last_fy NUMERIC,
  single_audit_required BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  subscription_tier TEXT,
  subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'annual')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── GRANTS PIPELINE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.grants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  funder TEXT NOT NULL,
  funder_type TEXT CHECK (funder_type IN ('federal', 'state', 'foundation', 'private', 'other')),
  cfda_number TEXT,
  amount NUMERIC,
  deadline DATE,
  submission_date DATE,
  award_date DATE,
  award_amount NUMERIC,
  status TEXT DEFAULT 'research'
    CHECK (status IN ('research', 'drafting', 'submitted', 'awarded', 'rejected', 'withdrawn')),
  program_type TEXT,
  notes TEXT,
  gepa_required BOOLEAN DEFAULT FALSE,
  single_audit_impact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER grants_updated_at
  BEFORE UPDATE ON public.grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── AI NARRATIVES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.narratives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE SET NULL,
  narrative_type TEXT NOT NULL
    CHECK (narrative_type IN ('needs_statement', 'project_description', 'goals_objectives',
                              'evaluation_plan', 'gepa_427', 'budget_justification', 'other')),
  prompt_input TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  attested BOOLEAN DEFAULT FALSE,
  attestation_id UUID,
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ATTESTATION LOGS ─────────────────────────────────────
-- This table is append-only. No updates or deletes.
CREATE TABLE IF NOT EXISTS public.attestation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  org_name TEXT NOT NULL,
  email TEXT NOT NULL,
  content_type TEXT NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE SET NULL,
  narrative_id UUID REFERENCES public.narratives(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  items_confirmed TEXT[] NOT NULL,
  attested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent any updates or deletes on attestation_logs (legal record)
CREATE OR REPLACE RULE attestation_logs_no_update AS
  ON UPDATE TO public.attestation_logs DO INSTEAD NOTHING;

CREATE OR REPLACE RULE attestation_logs_no_delete AS
  ON DELETE TO public.attestation_logs DO INSTEAD NOTHING;

-- ── COMPLIANCE EVENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('single_audit_due', 'sam_gov_expiry', 'grant_report_due',
                          'grant_deadline', 'close_out_due', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'complete', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Grants: users can only see/edit their own
CREATE POLICY "grants_all_own" ON public.grants USING (auth.uid() = user_id);

-- Narratives: users can only see/edit their own
CREATE POLICY "narratives_all_own" ON public.narratives USING (auth.uid() = user_id);

-- Attestation logs: users can insert and view their own; no edit/delete (enforced by rules above)
CREATE POLICY "attestation_select_own" ON public.attestation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attestation_insert_own" ON public.attestation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Compliance events: users can only see/edit their own
CREATE POLICY "compliance_all_own" ON public.compliance_events USING (auth.uid() = user_id);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_grants_user_id ON public.grants(user_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON public.grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON public.grants(deadline);
CREATE INDEX IF NOT EXISTS idx_narratives_user_id ON public.narratives(user_id);
CREATE INDEX IF NOT EXISTS idx_attestation_user_id ON public.attestation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_user_due ON public.compliance_events(user_id, due_date);

-- ── DONE ─────────────────────────────────────────────────
-- Run this, then set your Supabase URL and keys in .env.local
