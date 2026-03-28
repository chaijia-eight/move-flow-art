CREATE TABLE public.user_repertoires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Repertoire',
  side character(1) NOT NULL DEFAULT 'w',
  starting_fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  tree jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme_id text NOT NULL DEFAULT 'default',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_repertoires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repertoires"
ON public.user_repertoires FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repertoires"
ON public.user_repertoires FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repertoires"
ON public.user_repertoires FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repertoires"
ON public.user_repertoires FOR DELETE TO authenticated
USING (auth.uid() = user_id);