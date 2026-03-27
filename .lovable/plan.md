

## Plan: One-Time Redeem Code System

### Overview
The dev account (`xinya.vivian@me.com`) can generate unlimited single-use redeem codes. Any user can paste a code in Settings to get 1 month of free Pro. Once used, the code is burned.

### Database Changes

**1. New `redeem_codes` table**
- `id` (uuid, PK)
- `code` (text, unique) — the random code string
- `created_by` (uuid) — dev's user ID
- `redeemed_by` (uuid, nullable) — user who redeemed it
- `redeemed_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

RLS: Dev can insert/select all. Authenticated users can select (to validate codes).

**2. Add `expires_at` column to `user_entitlements`**
- `expires_at` (timestamptz, nullable) — null means permanent (existing dev code behavior preserved)

### Edge Functions

**3. New `generate-redeem-code` function**
- Authenticates caller, verifies email is `xinya.vivian@me.com`
- Generates a random 12-char alphanumeric code
- Inserts into `redeem_codes` table
- Returns the code string

**4. Update `redeem-code` function**
- First check `redeem_codes` table for a matching unused code (`redeemed_by IS NULL`)
- If found: mark as redeemed, insert into `user_entitlements` with `expires_at = now() + 1 month`
- If not found: fall back to existing hardcoded `VALID_CODES` check (permanent pro)

**5. Update `check-subscription` function**
- When checking `user_entitlements`, also check `expires_at IS NULL OR expires_at > now()` to respect expiry

### Frontend Changes

**6. Dev code generator in Settings (`Settings.tsx`)**
- New card visible only to `xinya.vivian@me.com`
- "Generate Code" button that calls the edge function
- Displays the generated code with a copy-to-clipboard button

**7. Rename existing `DeveloperCodeCard` to "Redeem Code"**
- The existing card already handles code redemption — just ensure it shows for all non-Pro users (it already does)
- Update the label from "Developer Code" to "Redeem Code" for clarity

### Technical Details

- Code format: 12-char alphanumeric (e.g., `A3kF9mXp2nYq`)
- The `redeem_codes` table acts as the single source of truth for code validity
- Expiry is enforced server-side in `check-subscription` so users can't bypass it
- Existing permanent "rabbit281877" code continues to work via the hardcoded fallback

