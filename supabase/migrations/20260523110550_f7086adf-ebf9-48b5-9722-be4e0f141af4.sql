
-- =========================================================
-- user_focus: focused opening IDs per user
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_focus (
  user_id UUID NOT NULL PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_focus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own focus"
  ON public.user_focus FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_user_focus_updated_at
  BEFORE UPDATE ON public.user_focus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_progress: per-user line progress as JSON map
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress"
  ON public.user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_repertoires: custom opening repertoires (Garden)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_repertoires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('w','b')),
  tree JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_repertoires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own repertoires"
  ON public.user_repertoires FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_repertoires_user ON public.user_repertoires(user_id, updated_at DESC);

CREATE TRIGGER set_user_repertoires_updated_at
  BEFORE UPDATE ON public.user_repertoires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
