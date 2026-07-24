-- ============================================================
-- HealthAI Prototype — Supabase Row Level Security (RLS) Policies
-- ============================================================
-- WARNING: Review this file carefully before executing.
-- Run this MANUALLY in the Supabase SQL Editor.
-- DO NOT auto-apply in CI/CD or migration scripts.
-- ============================================================

-- Enable RLS on all application tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ─── Helper function for admin check ───────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── users ─────────────────────────────────────────────────────────
CREATE POLICY "Users can read own row" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own row" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ─── profiles ──────────────────────────────────────────────────────
CREATE POLICY "Users can access own profile" ON public.profiles
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── medical_reports ───────────────────────────────────────────────
CREATE POLICY "Users can access own reports" ON public.medical_reports
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── files ─────────────────────────────────────────────────────────
CREATE POLICY "Users can access own files" ON public.files
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── record_embeddings ─────────────────────────────────────────────
CREATE POLICY "Users can read own embeddings" ON public.record_embeddings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own embeddings" ON public.record_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── appointments ──────────────────────────────────────────────────
CREATE POLICY "Users can access own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── symptoms ──────────────────────────────────────────────────────
CREATE POLICY "Users can access own symptoms" ON public.symptoms
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── vitals ────────────────────────────────────────────────────────
CREATE POLICY "Users can access own vitals" ON public.vitals
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── health_logs ───────────────────────────────────────────────────
CREATE POLICY "Users can access own health logs" ON public.health_logs
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── conversations ─────────────────────────────────────────────────
CREATE POLICY "Users can access own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── messages ──────────────────────────────────────────────────────
CREATE POLICY "Users can access own conversation messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    ) OR public.is_admin()
  );

-- ─── notifications ─────────────────────────────────────────────────
CREATE POLICY "Users can access own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── ai_sessions ──────────────────────────────────────────────────
CREATE POLICY "Users can access own AI sessions" ON public.ai_sessions
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ─── audit_logs ────────────────────────────────────────────────────
-- Strictly admins can view audit logs; server service role inserts entries
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- END OF RLS POLICIES
-- ============================================================
