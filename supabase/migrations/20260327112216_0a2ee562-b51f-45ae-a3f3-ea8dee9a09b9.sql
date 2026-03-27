
CREATE TABLE public.line_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id text NOT NULL UNIQUE,
  moves text[],
  crucial_moment_index integer,
  conclusion_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.line_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developer can manage line overrides"
  ON public.line_overrides
  FOR ALL
  TO authenticated
  USING (auth.email() = 'xinya.vivian@me.com')
  WITH CHECK (auth.email() = 'xinya.vivian@me.com');

CREATE POLICY "Anyone can read line overrides"
  ON public.line_overrides
  FOR SELECT
  TO authenticated, anon
  USING (true);
