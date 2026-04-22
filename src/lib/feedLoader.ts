/**
 * Phase 6: Personalized "For You" feed loader.
 *
 * Strategy:
 *   1. Fetch user's top weakness tags from `user_weaknesses` (active, by severity).
 *   2. Query `content` (joined with `blitz_content`) where tags overlap weaknesses,
 *      not seen in last 7 days, status = published. Mark them as personalized.
 *   3. Fall back to recent published content if no personalized hits.
 *   4. If DB returns nothing at all (cold start, no creators yet), use SEED_PUZZLES.
 *
 * Returns a uniform `FeedItem` list the UI can render with one card component.
 */
import { supabase } from "@/integrations/supabase/client";
import { SEED_PUZZLES, type SeedPuzzle, type WeaknessTag } from "@/data/seedPuzzles";

export interface FeedItem {
  id: string;
  title: string;
  fen: string;
  playerColor: "w" | "b";
  solutionSan: string[];
  hint: string;
  difficulty: number;
  weaknessTag: string;
  /** True = served because it matches one of the user's weakness tags. */
  personalized: boolean;
  /** True = synthetic puzzle (seed data, not in DB). */
  isSeed: boolean;
}

function seedToItem(p: SeedPuzzle, personalized: boolean): FeedItem {
  return {
    id: p.id,
    title: p.title,
    fen: p.fen,
    playerColor: p.playerColor,
    solutionSan: p.solutionSan,
    hint: p.hint,
    difficulty: p.difficulty,
    weaknessTag: p.weaknessTag,
    personalized,
    isSeed: true,
  };
}

/** Infer playerColor from FEN side-to-move. */
function colorFromFen(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

interface ContentRow {
  id: string;
  title: string | null;
  description: string | null;
  difficulty: number;
  tags: string[];
  blitz_content: {
    fen: string;
    solution_san: string[];
    hint: string | null;
  } | null;
}

export async function loadFeed(userId: string | null): Promise<FeedItem[]> {
  // 1. Pull weaknesses (best-effort)
  let weaknessTags: string[] = [];
  if (userId) {
    const { data } = await supabase
      .from("user_weaknesses")
      .select("weakness_tag, severity_score")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("severity_score", { ascending: false })
      .limit(5);
    weaknessTags = (data ?? []).map((w) => w.weakness_tag);
  }

  // 2. Personalized DB query
  let personalizedRows: ContentRow[] = [];
  if (weaknessTags.length > 0) {
    const { data } = await supabase
      .from("content")
      .select(
        "id, title, description, difficulty, tags, blitz_content(fen, solution_san, hint)",
      )
      .eq("status", "published")
      .eq("type", "blitz")
      .overlaps("tags", weaknessTags)
      .order("published_at", { ascending: false })
      .limit(20);
    personalizedRows = (data ?? []) as unknown as ContentRow[];
  }

  // 3. Generic recent-content fallback
  let recentRows: ContentRow[] = [];
  if (personalizedRows.length < 10) {
    const { data } = await supabase
      .from("content")
      .select(
        "id, title, description, difficulty, tags, blitz_content(fen, solution_san, hint)",
      )
      .eq("status", "published")
      .eq("type", "blitz")
      .order("published_at", { ascending: false })
      .limit(20);
    recentRows = (data ?? []) as unknown as ContentRow[];
  }

  const seenIds = new Set<string>();
  const items: FeedItem[] = [];

  const pushRow = (row: ContentRow, personalized: boolean) => {
    if (!row.blitz_content) return;
    if (seenIds.has(row.id)) return;
    seenIds.add(row.id);
    items.push({
      id: row.id,
      title: row.title ?? "Puzzle",
      fen: row.blitz_content.fen,
      playerColor: colorFromFen(row.blitz_content.fen),
      solutionSan: row.blitz_content.solution_san,
      hint: row.blitz_content.hint ?? "Look for the best move.",
      difficulty: row.difficulty,
      weaknessTag: row.tags[0] ?? "tactic",
      personalized,
      isSeed: false,
    });
  };

  for (const row of personalizedRows) pushRow(row, true);
  for (const row of recentRows) pushRow(row, false);

  // 4. Seed fallback. If we have weakness tags, prioritise matching seeds first.
  if (items.length < 10) {
    const matchingSeeds = SEED_PUZZLES.filter((p) =>
      weaknessTags.includes(p.weaknessTag),
    );
    const otherSeeds = SEED_PUZZLES.filter(
      (p) => !weaknessTags.includes(p.weaknessTag),
    );
    for (const p of matchingSeeds) items.push(seedToItem(p, true));
    for (const p of otherSeeds) items.push(seedToItem(p, false));
  }

  return items;
}

/**
 * Best-effort interaction logger. Skipped silently for seed puzzles since they
 * have no FK-safe content row.
 */
export async function logInteraction(opts: {
  userId: string;
  contentId: string;
  isSeed: boolean;
  interactionType: "solved" | "failed" | "skipped" | "view";
  xpEarned: number;
  weaknessTagTargeted: string | null;
  wasPersonalized: boolean;
  timeSpentMs?: number;
}) {
  if (opts.isSeed) return;
  const { error } = await supabase.from("user_content_interactions").insert({
    user_id: opts.userId,
    content_id: opts.contentId,
    interaction_type: opts.interactionType,
    xp_earned: opts.xpEarned,
    weakness_tag_targeted: opts.weaknessTagTargeted,
    was_personalized: opts.wasPersonalized,
    time_spent_ms: opts.timeSpentMs ?? null,
  });
  if (error) console.warn("[feedLoader] logInteraction failed", error);
}

export type { WeaknessTag };
