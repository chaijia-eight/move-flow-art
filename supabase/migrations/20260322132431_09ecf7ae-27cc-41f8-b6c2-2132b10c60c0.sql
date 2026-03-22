
-- Custom lines table for user-created opening lines ("Your Garden")
CREATE TABLE public.custom_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Line',
  moves TEXT[] NOT NULL, -- Array of SAN moves
  fens TEXT[] NOT NULL, -- Array of FENs for each position
  side CHAR(1) NOT NULL DEFAULT 'w' CHECK (side IN ('w', 'b')),
  move_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_lines ENABLE ROW LEVEL SECURITY;

-- Users can only see their own lines
CREATE POLICY "Users can view own custom lines"
  ON public.custom_lines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own lines
CREATE POLICY "Users can insert own custom lines"
  ON public.custom_lines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lines
CREATE POLICY "Users can update own custom lines"
  ON public.custom_lines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own lines
CREATE POLICY "Users can delete own custom lines"
  ON public.custom_lines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
