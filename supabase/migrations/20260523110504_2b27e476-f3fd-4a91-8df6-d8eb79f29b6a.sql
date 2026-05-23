
-- =========================================================
-- daily_usage: free-tier per-day counters
-- =========================================================
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL,
  lines_learned INTEGER NOT NULL DEFAULT 0,
  practice_used BOOLEAN NOT NULL DEFAULT false,
  analysis_used BOOLEAN NOT NULL DEFAULT false,
  last_trap_learned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own daily usage"
  ON public.daily_usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily usage"
  ON public.daily_usage FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily usage"
  ON public.daily_usage FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_daily_usage_updated_at
  BEFORE UPDATE ON public.daily_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- line_overrides: dev-authored edits to learning lines
-- =========================================================
CREATE TABLE IF NOT EXISTS public.line_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id TEXT NOT NULL UNIQUE,
  moves TEXT[],
  crucial_moment_index INTEGER,
  conclusion_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.line_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads line overrides"
  ON public.line_overrides FOR SELECT
  USING (true);

CREATE POLICY "Developer manages line overrides"
  ON public.line_overrides FOR ALL
  TO authenticated
  USING (auth.email() = 'xinya.vivian@me.com')
  WITH CHECK (auth.email() = 'xinya.vivian@me.com');

CREATE TRIGGER set_line_overrides_updated_at
  BEFORE UPDATE ON public.line_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- move_explanations: dev-authored per-move text
-- =========================================================
CREATE TABLE IF NOT EXISTS public.move_explanations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  line_index INTEGER NOT NULL,
  move_index INTEGER NOT NULL,
  move_san TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opening_id, variation_id, line_index, move_index)
);

ALTER TABLE public.move_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads move explanations"
  ON public.move_explanations FOR SELECT
  USING (true);

CREATE POLICY "Developer manages move explanations"
  ON public.move_explanations FOR ALL
  TO authenticated
  USING (auth.email() = 'xinya.vivian@me.com')
  WITH CHECK (auth.email() = 'xinya.vivian@me.com');

CREATE TRIGGER set_move_explanations_updated_at
  BEFORE UPDATE ON public.move_explanations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- opening_coaching: AI-generated strategic coaching per line
-- =========================================================
CREATE TABLE IF NOT EXISTS public.opening_coaching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  line_index INTEGER NOT NULL,
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  move_purposes JSONB NOT NULL DEFAULT '{}'::jsonb,
  deviation_hints JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'ai',
  model TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opening_id, variation_id, line_index)
);

ALTER TABLE public.opening_coaching ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated reads opening coaching"
  ON public.opening_coaching FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Developer manages opening coaching"
  ON public.opening_coaching FOR ALL
  TO authenticated
  USING (auth.email() = 'xinya.vivian@me.com')
  WITH CHECK (auth.email() = 'xinya.vivian@me.com');

CREATE TRIGGER set_opening_coaching_updated_at
  BEFORE UPDATE ON public.opening_coaching
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
