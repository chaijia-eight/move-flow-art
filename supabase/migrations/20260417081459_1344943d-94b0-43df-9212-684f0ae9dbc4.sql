
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS puzzle_rating integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS puzzle_wins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS puzzle_losses integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.puzzle_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  position_id uuid,
  fen text NOT NULL,
  best_san text NOT NULL,
  played_san text,
  passed boolean NOT NULL,
  rating_before integer NOT NULL,
  rating_after integer NOT NULL,
  rating_delta integer NOT NULL,
  puzzle_rating integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.puzzle_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own puzzle attempts"
  ON public.puzzle_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own puzzle attempts"
  ON public.puzzle_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user_created
  ON public.puzzle_attempts(user_id, created_at DESC);
