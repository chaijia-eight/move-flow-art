-- Ensure upsert target exists for weaknesses + interaction logging hot paths.
CREATE UNIQUE INDEX IF NOT EXISTS user_weaknesses_user_tag_idx
  ON public.user_weaknesses (user_id, weakness_tag);

CREATE INDEX IF NOT EXISTS user_content_interactions_user_idx
  ON public.user_content_interactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS content_published_idx
  ON public.content (status, type, published_at DESC);

CREATE INDEX IF NOT EXISTS content_tags_gin_idx
  ON public.content USING GIN (tags);