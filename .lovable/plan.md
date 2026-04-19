# ArcChess Pivot — Creator Platform with Smart Feed

> **Status:** Planning. No code changes yet. Review this doc and tell me what to adjust before we start building.

---

## 1. The product, in one paragraph

A vertical-scroll chess content app. You open it → full-screen chess puzzle → solve → swipe up → next puzzle. Two content types: **Blitz** (15-30s, 1-2 move puzzles) and **Deep Dives** (2-5min, multi-step lessons). Anyone can publish content. The "For You" feed is personalized by **your actual games** — we link your Chess.com/Lichess account, run Stockfish on your last 30 days, and prioritize content that targets your specific weaknesses. TikTok loop + Duolingo streaks + Chess.com substance.

---

## 2. What survives, what dies

### Keep (and adapt)
| Asset | New role |
|---|---|
| Supabase auth + `user_profiles` | Same |
| Chess.com / Lichess linking (`Connect.tsx`, `fetch-games` edge fn) | Powers the algorithm, not a standalone page |
| `gameAnalyzer.ts` + Stockfish WASM | Runs in background after game sync, populates `user_weaknesses` |
| `Chessboard.tsx` (interactions, sounds, drag, promotion) | Core of every Blitz/Deep Dive |
| Framer Motion + ConfettiBurst + chessSounds | Feedback layer |
| Theme system (dark/light, board colors) | Same, expanded for Pro themes |
| Stripe subscription (`check-subscription`, `create-checkout`, `customer-portal`) | Repriced to $2.99 consumer / $9.99 creator |
| `lichessPuzzle.ts` | Fallback content source |

### Hide from nav (files stay for reference, deleted later)
Forge, ForgeHub, Oracle, OracleTrial, Campaigns, CampaignDrill, PillarView, TrialBattle, DailyRitual, Mistakes, Games, Puzzles, Review, Stats, Vault, plus their data files (`campaignData`, `oracleData`, `pillarTrials`, `trapTrees`, `openings`, `openingTrees`, `lineConclusions`, `rpgData`, `learningPath`, `studySidebar`, etc.).

### Delete from DB (migration drops these tables)
`daily_rituals`, `daily_usage`, `line_overrides`, `move_explanations`, `pillar_progress`, `player_characters`, `player_unlocks`, `puzzle_attempts`, `skill_tree_progress`, `training_sessions`, `trial_history`, `user_focus`, `user_progress`, `user_repertoires`, `warmup_sessions`, `custom_lines`.

### Keep in DB
`user_profiles` (extended), `user_games`, `user_positions` (renamed conceptually to "detected weaknesses source"), `user_entitlements`, `redeem_codes`.

---

## 3. New database schema

All new tables get RLS. Public-readable: `content`, `blitz_content`, `deep_dive_content`, `deep_dive_steps`, `users` (profile fields). User-scoped: `user_weaknesses`, `user_content_interactions`, `collections`, `tips`, `follows`, `comments`, `reports`.

```
-- Extend user_profiles
ALTER TABLE user_profiles ADD COLUMN
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  consumer_level INT DEFAULT 1,
  consumer_xp INT DEFAULT 0,
  creator_level INT DEFAULT 1,
  creator_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_points INT DEFAULT 0,
  last_streak_date DATE,
  last_analysis_at TIMESTAMPTZ;

-- Weakness profile (one row per user × weakness category)
user_weaknesses (
  user_id, weakness_tag TEXT,        -- 'fork', 'pin', 'skewer', 'back_rank', 'rook_endgame', 'time_pressure'
  severity_score INT,                 -- 1-10, decays over time
  times_missed INT,
  times_solved_since INT,             -- resets to 0 on new miss
  last_seen TIMESTAMPTZ,
  status TEXT                         -- 'active' | 'improved'
)

-- Content (parent table)
content (
  id, creator_id, type,               -- 'blitz' | 'deep_dive'
  status,                             -- 'draft' | 'published' | 'hidden' | 'reported'
  title, description, thumbnail_fen,
  tags TEXT[],                        -- searchable algo tags
  difficulty INT,                     -- 1-10
  views INT, completions INT, completion_rate REAL,
  is_featured BOOL, is_team_content BOOL,
  created_at, published_at
)

blitz_content (
  content_id PK, fen, solution_san TEXT[],   -- supports 1-2 move solutions
  time_limit_seconds INT, hint TEXT
)

deep_dive_content (
  content_id PK, total_steps INT, est_duration_seconds INT
)

deep_dive_steps (
  id, content_id, step_number,
  fen, prompt TEXT, solution_san TEXT[],
  hint TEXT, context_before TEXT,
  is_branch_point BOOL, branch_parent_step_id
)

-- Interactions (the algorithm's training data)
user_content_interactions (
  id, user_id, content_id,
  interaction_type,                   -- 'view' | 'solved' | 'failed' | 'skipped' | 'completed'
  time_spent_ms INT,
  xp_earned INT,
  was_personalized BOOL,
  weakness_tag_targeted TEXT,         -- nullable; which weakness this content addressed
  created_at
)

collections (id, user_id, name, content_ids UUID[])
follows (follower_id, following_id, created_at)
tips (id, from_user_id, to_creator_id, content_id, points_amount, created_at)
comments (id, content_id, user_id, text, likes_count, created_at)
reports (id, content_id, reporter_id, reason, status, created_at)
```

---

## 4. The algorithm (concrete rules)

**For You feed query:**
1. Fetch user's top 3 active weaknesses (highest severity_score).
2. Build a content pool:
   - 50% — `content` where `tags && ARRAY[user_weaknesses]` (overlaps), not seen in last 7d
   - 30% — `content` at `difficulty BETWEEN user_level-1 AND user_level+1`, not seen in last 7d
   - 20% — `content` from creators the user follows, ordered by `published_at`
3. Shuffle within tiers but keep tier ratios. Page size 20.
4. Mark each item with `was_personalized` and `weakness_tag_targeted` for analytics.

**Weakness detection** (runs after every game sync, in an edge function):
- Loop through positions in `user_positions` (created by existing `gameAnalyzer.ts`).
- Tag each blunder by heuristic: knight move that misses a fork target → `fork`, undefended rook on back rank when mated → `back_rank`, etc.
- Upsert into `user_weaknesses` (increment `times_missed`, bump `severity_score` capped at 10).
- Decay rule: each correct solve in that tag decrements `times_solved_since`; when `times_solved_since >= 10`, set `status='improved'` and decay severity by 2.

---

## 5. New page/route map

```
/                  → Feed (the only "home")
/create            → Creator hub (Blitz editor | Deep Dive builder)
/profile/:username → Public profile (bio, content tabs, follow button)
/me                → Your profile + collections + weakness trends (Pro)
/settings          → Account, themes, sound, link Chess.com/Lichess, subscription
/auth              → Existing
```

Sidebar disappears on `/` (full-screen feed). Slim top bar with tabs (For You / Trending / Following) + share. Bottom nav on mobile: Feed · Create · Me.

---

## 6. Build order (revised, smaller weeks)

| Phase | Deliverable | Verifiable as |
|---|---|---|
| **0. Plan** (this doc) | You approve scope, schema, route map | Reading this |
| **1. DB migration** | Drop old tables, add new ones with RLS | Tables visible in backend |
| **2. Hide old pages** | Sidebar shrinks to Feed/Create/Me, old routes still work directly | Nav looks new |
| **3. Feed shell** | `/` renders vertical-snap scroll with 10 hardcoded Blitz puzzles | Scroll & solve loop works |
| **4. XP + streaks** | Solve → XP toast, streak counter, level-up animation | Visible on feed |
| **5. Game-link → weakness pipeline** | After sync, weaknesses populate `user_weaknesses` | Inspect table |
| **6. Personalized feed** | "For You" tab queries by weakness; gold tag on personalized items | Visible badge |
| **7. Blitz creator** | `/create` board editor → publish → appears in feed | Round-trip works |
| **8. Deep Dive consumer** | One hardcoded 3-step Deep Dive renders in feed | Plays through |
| **9. Deep Dive creator** | Step builder | Round-trip works |
| **10. Social** | Follow, comment, tip, Trending tab, reports | All 4 tabs functional |
| **11. Pro gating + repricing** | New $2.99 / $9.99 tiers, ads slots, gates | Checkout works |

I'd recommend stopping after **Phase 6** for a first major check-in — that's the unique value prop validated end-to-end.

---

## 7. Open questions for you

1. **Seed content (week 1)** — you didn't answer this. Pick one:
   - (a) Hardcode 10 puzzles in a TS file with hand-tagged categories (best for testing personalization)
   - (b) Pull from Lichess puzzle API live (real, infinite, but tags are coarse)
   - (c) Both — start with 10 hand-tagged, fall back to Lichess
2. **Username collisions** — current users only have email. On first login post-migration, prompt for a username before they can use the app?
3. **Existing user data** — keep their `user_games` and `user_positions` so the weakness algorithm has data day-1, or wipe everything?
4. **Mobile-first or responsive both?** — The feed is described as portrait phone. Build mobile-first and let desktop be a centered phone-shaped column, or full-bleed desktop layout too?
5. **Ads** — placeholder slots only, or actually wire up an ad network later?
6. **Stockfish in browser vs edge** — current pipeline is client-side WASM. Heavy on user devices. Move to a Supabase edge function with Stockfish-on-server? (Trade-off: edge functions have CPU/time limits, may need to chunk.)
7. **Creator XP, points, tips economy** — build now (phase 10) or defer to v2?

Answer these and I'll start Phase 1 (DB migration).
