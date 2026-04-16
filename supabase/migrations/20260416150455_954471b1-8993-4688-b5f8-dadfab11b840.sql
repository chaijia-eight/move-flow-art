
-- Player character data
CREATE TABLE public.player_characters (
  user_id UUID PRIMARY KEY NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  embers INTEGER NOT NULL DEFAULT 0,
  current_rank TEXT NOT NULL DEFAULT 'novice',
  streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_ritual_date DATE,
  main_pillar TEXT,
  equipped_theme TEXT NOT NULL DEFAULT 'default',
  equipped_piece_set TEXT NOT NULL DEFAULT 'classic',
  equipped_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.player_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own character" ON public.player_characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own character" ON public.player_characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own character" ON public.player_characters FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_player_characters_updated_at
  BEFORE UPDATE ON public.player_characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily rituals
CREATE TABLE public.daily_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ritual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quest_1_type TEXT NOT NULL,
  quest_1_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  quest_1_completed BOOLEAN NOT NULL DEFAULT false,
  quest_2_type TEXT NOT NULL,
  quest_2_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  quest_2_completed BOOLEAN NOT NULL DEFAULT false,
  quest_3_type TEXT NOT NULL,
  quest_3_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  quest_3_completed BOOLEAN NOT NULL DEFAULT false,
  bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  embers_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ritual_date)
);

ALTER TABLE public.daily_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rituals" ON public.daily_rituals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rituals" ON public.daily_rituals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rituals" ON public.daily_rituals FOR UPDATE USING (auth.uid() = user_id);

-- Pillar progress
CREATE TABLE public.pillar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pillar TEXT NOT NULL,
  current_floor INTEGER NOT NULL DEFAULT 1,
  trials_completed INTEGER NOT NULL DEFAULT 0,
  total_trials_mastered INTEGER NOT NULL DEFAULT 0,
  boss_defeated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pillar)
);

ALTER TABLE public.pillar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pillar progress" ON public.pillar_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pillar progress" ON public.pillar_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pillar progress" ON public.pillar_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_pillar_progress_updated_at
  BEFORE UPDATE ON public.pillar_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trial history
CREATE TABLE public.trial_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pillar TEXT NOT NULL,
  floor_number INTEGER NOT NULL,
  trial_number INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  best_accuracy REAL,
  passed BOOLEAN NOT NULL DEFAULT false,
  perfect_clear BOOLEAN NOT NULL DEFAULT false,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial history" ON public.trial_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trial history" ON public.trial_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trial history" ON public.trial_history FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_trial_history_updated_at
  BEFORE UPDATE ON public.trial_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Player unlocks
CREATE TABLE public.player_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unlock_type TEXT NOT NULL,
  unlock_id TEXT NOT NULL,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, unlock_type, unlock_id)
);

ALTER TABLE public.player_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks" ON public.player_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlocks" ON public.player_unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unlocks" ON public.player_unlocks FOR UPDATE USING (auth.uid() = user_id);
