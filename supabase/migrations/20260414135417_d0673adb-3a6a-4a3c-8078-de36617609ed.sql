-- User profiles for chess platform connections
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  chesscom_username TEXT,
  lichess_username TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User games imported from chess platforms
CREATE TABLE public.user_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('chesscom', 'lichess')),
  game_id TEXT NOT NULL,
  opponent TEXT,
  result TEXT,
  played_at TIMESTAMP WITH TIME ZONE,
  pgn TEXT,
  time_control TEXT,
  analyzed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, game_id)
);

ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own games"
  ON public.user_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON public.user_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games"
  ON public.user_games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games"
  ON public.user_games FOR DELETE
  USING (auth.uid() = user_id);

-- Critical positions extracted from games
CREATE TABLE public.user_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID REFERENCES public.user_games(id) ON DELETE CASCADE,
  fen TEXT NOT NULL,
  move_number INTEGER NOT NULL,
  your_move_san TEXT,
  engine_best_san TEXT,
  eval_before REAL,
  eval_after REAL,
  category TEXT NOT NULL CHECK (category IN ('blunder', 'missed_tactic', 'defensive_crux', 'endgame_tech')),
  difficulty_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions"
  ON public.user_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions"
  ON public.user_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own positions"
  ON public.user_positions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_games_user_id ON public.user_games(user_id);
CREATE INDEX idx_user_games_platform ON public.user_games(user_id, platform);
CREATE INDEX idx_user_positions_user_id ON public.user_positions(user_id);
CREATE INDEX idx_user_positions_category ON public.user_positions(user_id, category);
CREATE INDEX idx_user_positions_fen ON public.user_positions(fen);

-- Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();