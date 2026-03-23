
CREATE TABLE public.move_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  line_index INTEGER NOT NULL DEFAULT 0,
  move_index INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opening_id, variation_id, line_index, move_index)
);

ALTER TABLE public.move_explanations ENABLE ROW LEVEL SECURITY;

-- Anyone can read explanations
CREATE POLICY "Anyone can read move explanations"
  ON public.move_explanations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only the developer can insert/update/delete
CREATE POLICY "Developer can manage move explanations"
  ON public.move_explanations FOR ALL
  TO authenticated
  USING (auth.email() = 'xinya.vivian@me.com')
  WITH CHECK (auth.email() = 'xinya.vivian@me.com');
