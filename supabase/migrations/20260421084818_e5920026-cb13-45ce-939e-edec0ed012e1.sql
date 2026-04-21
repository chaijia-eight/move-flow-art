
-- ============================================================
-- DROP legacy tables
-- ============================================================
DROP TABLE IF EXISTS public.daily_rituals CASCADE;
DROP TABLE IF EXISTS public.daily_usage CASCADE;
DROP TABLE IF EXISTS public.line_overrides CASCADE;
DROP TABLE IF EXISTS public.move_explanations CASCADE;
DROP TABLE IF EXISTS public.pillar_progress CASCADE;
DROP TABLE IF EXISTS public.player_characters CASCADE;
DROP TABLE IF EXISTS public.player_unlocks CASCADE;
DROP TABLE IF EXISTS public.puzzle_attempts CASCADE;
DROP TABLE IF EXISTS public.skill_tree_progress CASCADE;
DROP TABLE IF EXISTS public.training_sessions CASCADE;
DROP TABLE IF EXISTS public.trial_history CASCADE;
DROP TABLE IF EXISTS public.user_focus CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.user_repertoires CASCADE;
DROP TABLE IF EXISTS public.warmup_sessions CASCADE;
DROP TABLE IF EXISTS public.custom_lines CASCADE;

-- ============================================================
-- EXTEND user_profiles
-- ============================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS consumer_level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS consumer_xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS creator_xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date DATE,
  ADD COLUMN IF NOT EXISTS last_analysis_at TIMESTAMPTZ;

-- Public read of profile fields (needed for creator profiles, comment authors, etc.)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

-- ============================================================
-- user_weaknesses
-- ============================================================
CREATE TABLE public.user_weaknesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weakness_tag TEXT NOT NULL,
  severity_score INT NOT NULL DEFAULT 1,
  times_missed INT NOT NULL DEFAULT 0,
  times_solved_since INT NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, weakness_tag)
);
ALTER TABLE public.user_weaknesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own weaknesses" ON public.user_weaknesses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own weaknesses" ON public.user_weaknesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own weaknesses" ON public.user_weaknesses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own weaknesses" ON public.user_weaknesses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_weaknesses_updated_at BEFORE UPDATE ON public.user_weaknesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_user_weaknesses_user_status ON public.user_weaknesses (user_id, status, severity_score DESC);

-- ============================================================
-- content (parent table)
-- ============================================================
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blitz','deep_dive')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','hidden','reported')),
  title TEXT,
  description TEXT,
  thumbnail_fen TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty INT NOT NULL DEFAULT 5 CHECK (difficulty BETWEEN 1 AND 10),
  views INT NOT NULL DEFAULT 0,
  completions INT NOT NULL DEFAULT 0,
  completion_rate REAL NOT NULL DEFAULT 0,
  is_featured BOOL NOT NULL DEFAULT false,
  is_team_content BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published content" ON public.content FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);
CREATE POLICY "Users create own content" ON public.content FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own content" ON public.content FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete own content" ON public.content FOR DELETE TO authenticated USING (auth.uid() = creator_id);
CREATE TRIGGER trg_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_content_status_published_at ON public.content (status, published_at DESC);
CREATE INDEX idx_content_tags ON public.content USING GIN (tags);
CREATE INDEX idx_content_creator ON public.content (creator_id);

-- ============================================================
-- blitz_content
-- ============================================================
CREATE TABLE public.blitz_content (
  content_id UUID PRIMARY KEY REFERENCES public.content(id) ON DELETE CASCADE,
  fen TEXT NOT NULL,
  solution_san TEXT[] NOT NULL,
  time_limit_seconds INT,
  hint TEXT
);
ALTER TABLE public.blitz_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads blitz tied to readable content" ON public.blitz_content FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content c WHERE c.id = blitz_content.content_id AND (c.status = 'published' OR c.creator_id = auth.uid()))
);
CREATE POLICY "Creators write own blitz" ON public.blitz_content FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.content c WHERE c.id = blitz_content.content_id AND c.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.content c WHERE c.id = blitz_content.content_id AND c.creator_id = auth.uid()));

-- ============================================================
-- deep_dive_content + steps
-- ============================================================
CREATE TABLE public.deep_dive_content (
  content_id UUID PRIMARY KEY REFERENCES public.content(id) ON DELETE CASCADE,
  total_steps INT NOT NULL DEFAULT 0,
  est_duration_seconds INT
);
ALTER TABLE public.deep_dive_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads deep_dive tied to readable content" ON public.deep_dive_content FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_content.content_id AND (c.status = 'published' OR c.creator_id = auth.uid()))
);
CREATE POLICY "Creators write own deep_dive" ON public.deep_dive_content FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_content.content_id AND c.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_content.content_id AND c.creator_id = auth.uid()));

CREATE TABLE public.deep_dive_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  fen TEXT NOT NULL,
  prompt TEXT,
  solution_san TEXT[] NOT NULL,
  hint TEXT,
  context_before TEXT,
  is_branch_point BOOL NOT NULL DEFAULT false,
  branch_parent_step_id UUID REFERENCES public.deep_dive_steps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deep_dive_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads steps of readable content" ON public.deep_dive_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_steps.content_id AND (c.status = 'published' OR c.creator_id = auth.uid()))
);
CREATE POLICY "Creators write own steps" ON public.deep_dive_steps FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_steps.content_id AND c.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.content c WHERE c.id = deep_dive_steps.content_id AND c.creator_id = auth.uid()));
CREATE INDEX idx_deep_dive_steps_content ON public.deep_dive_steps (content_id, step_number);

-- ============================================================
-- user_content_interactions
-- ============================================================
CREATE TABLE public.user_content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view','solved','failed','skipped','completed')),
  time_spent_ms INT,
  xp_earned INT NOT NULL DEFAULT 0,
  was_personalized BOOL NOT NULL DEFAULT false,
  weakness_tag_targeted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own interactions" ON public.user_content_interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own interactions" ON public.user_content_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_uci_user_created ON public.user_content_interactions (user_id, created_at DESC);
CREATE INDEX idx_uci_user_content ON public.user_content_interactions (user_id, content_id);

-- ============================================================
-- collections
-- ============================================================
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- follows
-- ============================================================
CREATE TABLE public.follows (
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users create own follows" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users delete own follows" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
CREATE INDEX idx_follows_following ON public.follows (following_id);

-- ============================================================
-- tips
-- ============================================================
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_creator_id UUID NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
  points_amount INT NOT NULL CHECK (points_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_user_id <> to_creator_id)
);
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads tips" ON public.tips FOR SELECT USING (true);
CREATE POLICY "Users send own tips" ON public.tips FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE INDEX idx_tips_creator ON public.tips (to_creator_id);

-- ============================================================
-- comments
-- ============================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users post own comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_comments_content ON public.comments (content_id, created_at DESC);

-- ============================================================
-- reports
-- ============================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed','actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Users file own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
