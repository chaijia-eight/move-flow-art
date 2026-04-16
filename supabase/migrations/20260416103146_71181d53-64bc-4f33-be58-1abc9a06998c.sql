
-- Add new columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS warmup_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_pillar text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS skill_rating integer DEFAULT NULL;

-- Training sessions table
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('forge', 'campaigns', 'oracle')),
  session_type text NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  accuracy real DEFAULT NULL,
  positions_attempted integer NOT NULL DEFAULT 0,
  positions_correct integer NOT NULL DEFAULT 0,
  duration_seconds integer DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training sessions"
  ON public.training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions"
  ON public.training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Skill tree progress table
CREATE TABLE public.skill_tree_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  branch text NOT NULL CHECK (branch IN ('tactics', 'positional', 'endgames')),
  skill_name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  mastered boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  best_accuracy real DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, branch, skill_name)
);

ALTER TABLE public.skill_tree_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill tree"
  ON public.skill_tree_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill tree"
  ON public.skill_tree_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill tree"
  ON public.skill_tree_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_skill_tree_updated_at
  BEFORE UPDATE ON public.skill_tree_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Warmup sessions table
CREATE TABLE public.warmup_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weakness_category text NOT NULL,
  diagnostic_correct integer NOT NULL DEFAULT 0,
  diagnostic_total integer NOT NULL DEFAULT 3,
  practice_correct integer NOT NULL DEFAULT 0,
  practice_total integer NOT NULL DEFAULT 5,
  went_to_battle boolean NOT NULL DEFAULT false,
  won_after boolean DEFAULT NULL,
  warmup_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, warmup_date)
);

ALTER TABLE public.warmup_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warmups"
  ON public.warmup_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own warmups"
  ON public.warmup_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own warmups"
  ON public.warmup_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
