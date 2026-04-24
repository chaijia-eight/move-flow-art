
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_user_event_idx ON public.analytics_events (user_id, event_name, created_at DESC);
CREATE INDEX analytics_events_event_idx ON public.analytics_events (event_name, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own analytics" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
