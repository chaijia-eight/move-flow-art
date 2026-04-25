# Project Memory

## Core
- ArcChess is a personal chess training companion: warmup before games, skill tree campaigns, endgame mastery.
- Stack: React, Vite, Tailwind, Framer Motion, chess.js, Supabase, Vercel SPA routing.
- Core logic: Sync games (Chess.com/Lichess), analyze with Stockfish WASM, drill mistakes via The Forge.
- Three pillars: Forge (daily warmup), Campaigns (skill trees), Oracle (endgame mastery).
- Database uses `user_profiles`, `user_games`, `user_positions`, `training_sessions`, `skill_tree_progress`, `warmup_sessions`.
- Do not use a TikTok-style vertical snap-scrolling feed; the user rejected the scrolling concept.
- UI Aesthetic: 3D 'pressed-plastic' (multi-layered shadows, lift -4px on hover, depress +1px on click).
- Sidebar: Forge, Campaigns, Oracle, Stats, Settings.

## Memories
- [No Vertical Feed](mem://constraint/no-vertical-feed) — Rejected TikTok-style vertical scrolling feed concept
- [Philosophy](mem://product/philosophy) — Personal chess trainer: warmup, skill trees, endgame mastery
- [Architecture](mem://tech/data-architecture/pivot-schema) — Current DB schema with training tables
- [Tech Stack](mem://tech/stack) — Core libraries and backend services
- [Visual Depth](mem://style/3d-visual-depth) — 3D 'pressed-plastic' aesthetic rules
- [App Layout](mem://style/app-layout) — 5-item sidebar: Forge, Campaigns, Oracle, Stats, Settings
- [Branding Identity](mem://branding/identity) — App name, slogan, and logo
- [Logo Assets](mem://style/logo-assets) — Details on the golden knight favicon
- [Piece Design](mem://style/piece-design) — Lichess Cburnett SVG assets at 88% scale
- [Move Visualization](mem://features/move-visualization-system) — Colors, shapes, and animations for board interaction
- [Board Interaction](mem://features/board-interaction) — Click-to-move and drag-and-drop mechanics
- [Audio System](mem://style/audio-system) — Chess.com sound assets and priority rules
- [Celebration Effects](mem://features/celebration-effects) — Confetti bursts for milestone achievements
- [Premium Visuals](mem://style/premium-visual-identity) — Gold glow aesthetic for Pro users
- [Account Connection](mem://features/account-connection) — Chess.com/Lichess 30-day game sync via Supabase Edge Functions
- [Analysis Pipeline](mem://tech/logic/analysis-pipeline) — Stockfish WASM classifying blunders and critical moments
- [Promotion System](mem://features/promotion-system) — Interactive target square piece selection
- [User Settings](mem://features/user-settings) — App configuration and progress reset logic
- [User Accounts](mem://auth/user-accounts) — Supabase user management
- [Authentication Gate](mem://auth/authentication-gate) — Routing logic for unauthenticated users
- [Cloud Sync](mem://tech/persistence/cloud-sync) — Supabase jsonb debounced syncing strategy
- [Engine Integration](mem://tech/logic/engine-integration) — Stockfish evaluation from White's perspective
- [SPA Routing](mem://tech/deployment/spa-routing) — Catch-all routing config
