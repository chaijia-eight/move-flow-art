/**
 * detect-weaknesses
 *
 * Reads positions in `user_positions` for the calling user (rows produced by
 * the client-side game analyzer), assigns each one a coarse weakness tag, and
 * upserts aggregate counts into `user_weaknesses`.
 *
 * Heuristics are intentionally simple — accuracy improves later. The point of
 * Phase 5 is end-to-end plumbing: blunders -> tags -> personalized feed.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Position = {
  id: string;
  fen: string;
  category: string;
  your_move_san: string | null;
  engine_best_san: string | null;
  move_number: number;
};

/** Count pieces on the board portion of a FEN. */
function countPieces(fen: string): number {
  const board = fen.split(" ")[0] ?? "";
  return (board.match(/[rnbqkpRNBQKP]/g) ?? []).length;
}

function isEndgame(fen: string): boolean {
  const board = fen.split(" ")[0] ?? "";
  const queens = (board.match(/[qQ]/g) ?? []).length;
  const pieces = countPieces(fen);
  return pieces <= 12 || (queens === 0 && pieces <= 16);
}

/** Side to move per FEN. */
function sideToMove(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/** Very loose tag inference. Order matters — return on first match. */
function tagPosition(p: Position): string {
  const best = p.engine_best_san ?? "";
  const fen = p.fen;
  const stm = sideToMove(fen);

  if (p.category === "endgame_tech" || isEndgame(fen)) {
    if (best.startsWith("R") || best.startsWith("K")) return "rook_endgame";
    return "endgame_tech";
  }

  // Mate notation in best move = missed mate.
  if (best.endsWith("#")) {
    return best.includes("M2") ? "mate_in_2" : "mate_in_1";
  }

  // Knight forks: knight move that gives check or captures often = fork.
  if (/^N/.test(best) && (best.includes("+") || best.includes("x"))) {
    return "fork";
  }

  // Bishop pin / skewer attempts.
  if (/^B/.test(best) && best.includes("+")) return "pin";
  if (/^R/.test(best) && best.includes("+") && countPieces(fen) <= 14)
    return "skewer";

  // Back-rank mate signature: enemy king on back rank, mating piece is rook/queen.
  const board = fen.split(" ")[0] ?? "";
  const ranks = board.split("/");
  const oppKingRank =
    stm === "w" ? ranks[0] ?? "" : ranks[ranks.length - 1] ?? "";
  if (
    /k/i.test(oppKingRank) &&
    (best.startsWith("R") || best.startsWith("Q")) &&
    best.includes("+")
  ) {
    return "back_rank";
  }

  // Captures often signal hanging-piece tactics.
  if (best.includes("x")) {
    if (/^[QRBN]/.test(best)) return "hanging_piece";
    return "double_attack";
  }

  // Default fallback by category.
  switch (p.category) {
    case "missed_tactic":
      return "double_attack";
    case "defensive_crux":
      return "trapped_piece";
    case "blunder":
    default:
      return "hanging_piece";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: positions, error: posErr } = await supabase
      .from("user_positions")
      .select("id, fen, category, your_move_san, engine_best_san, move_number")
      .eq("user_id", user.id)
      .limit(500);

    if (posErr) {
      console.error("[detect-weaknesses] fetch positions failed", posErr);
      return new Response(JSON.stringify({ error: "Failed to read positions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tag and aggregate counts per tag.
    const counts = new Map<string, number>();
    for (const p of (positions ?? []) as Position[]) {
      const tag = tagPosition(p);
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    // Read existing rows to preserve solve counters.
    const { data: existing } = await supabase
      .from("user_weaknesses")
      .select("id, weakness_tag, severity_score, times_missed, times_solved_since")
      .eq("user_id", user.id);

    const existingByTag = new Map<string, (typeof existing)[number]>();
    for (const row of existing ?? []) existingByTag.set(row.weakness_tag, row);

    const upserts: Array<Record<string, unknown>> = [];
    for (const [tag, missed] of counts) {
      const prev = existingByTag.get(tag);
      // Severity = clamp(log-ish of misses), capped at 10.
      const severity = Math.min(10, Math.max(1, Math.ceil(Math.log2(missed + 1) + 1)));
      upserts.push({
        user_id: user.id,
        weakness_tag: tag,
        severity_score: Math.max(severity, prev?.severity_score ?? 0),
        times_missed: (prev?.times_missed ?? 0) + missed,
        times_solved_since: prev?.times_solved_since ?? 0,
        last_seen: new Date().toISOString(),
        status: "active",
      });
    }

    let updated = 0;
    for (const row of upserts) {
      const { error } = await supabase
        .from("user_weaknesses")
        .upsert(row, { onConflict: "user_id,weakness_tag" });
      if (!error) updated++;
      else console.warn("[detect-weaknesses] upsert failed", error);
    }

    // Stamp last_analysis_at on profile.
    await supabase
      .from("user_profiles")
      .update({ last_analysis_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        positionsAnalyzed: positions?.length ?? 0,
        weaknessesUpdated: updated,
        tags: Object.fromEntries(counts),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[detect-weaknesses] error", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
