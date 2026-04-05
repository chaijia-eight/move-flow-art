

# Premium Gold Glow — Visual Upgrade for Pro Users

## Summary
When a user has Pro status, the app should feel noticeably more premium with gold glow accents throughout the UI — on the sidebar, the dashboard header, cards, and key interactive elements.

## Changes

### 1. AppLayout sidebar — gold accent strip & logo glow (src/components/AppLayout.tsx)
- Import `useSubscription` and read `isPro`
- When `isPro`, add a thin vertical gold gradient line on the sidebar's right border
- Add a subtle gold `box-shadow` glow around the logo button
- Add a small Crown icon or gold dot indicator below the logo

### 2. Dashboard header — enhanced premium badge (src/pages/Index.tsx)
- Upgrade the existing "Premium" badge (line ~285) from a static pill to an animated one with a shimmer sweep effect and a gold glow shadow
- Add a subtle gold gradient underline to the "ArcChess" title when Pro

### 3. Global CSS — premium utility classes (src/index.css)
- Add a `.premium-glow` utility class with a gold box-shadow (`hsl(42 90% 60%)`)
- Add a `.premium-shimmer` class with the existing shimmer keyframe for badge/button highlights
- Add a `.premium-border` class that applies a gold gradient border

### 4. Card accents for Pro users (src/components/OpeningCard.tsx)
- When `isPro` (from `useSubscription`), add a faint gold top-border or corner accent to opening cards

### 5. Sidebar nav buttons — gold active state (src/components/AppLayout.tsx)
- When `isPro` and a nav button is active, use a gold-tinted highlight (`bg-[hsl(42,90%,60%)]/15`) instead of the default `bg-primary/15`

## Technical Details
- All changes are purely visual / CSS-driven — no database or backend changes
- The `useSubscription()` hook is already available and provides `isPro`
- Shimmer keyframe already exists in `index.css`; will reuse it
- Gold color token: `hsl(42 90% 60%)` (consistent with existing `--move-main` and CTA shimmers)

