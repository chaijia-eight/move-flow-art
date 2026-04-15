
ALTER TABLE public.user_positions ADD COLUMN drilled boolean NOT NULL DEFAULT false;

CREATE POLICY "Users can update own positions"
ON public.user_positions
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
