
-- Create redeem_codes table
CREATE TABLE public.redeem_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  redeemed_by UUID,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;

-- Dev can do everything
CREATE POLICY "Developer can manage redeem codes"
ON public.redeem_codes
FOR ALL
TO authenticated
USING (auth.email() = 'xinya.vivian@me.com')
WITH CHECK (auth.email() = 'xinya.vivian@me.com');

-- Authenticated users can select (to validate codes during redemption)
CREATE POLICY "Authenticated users can read redeem codes"
ON public.redeem_codes
FOR SELECT
TO authenticated
USING (true);

-- Add expires_at to user_entitlements (null = permanent)
ALTER TABLE public.user_entitlements ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
