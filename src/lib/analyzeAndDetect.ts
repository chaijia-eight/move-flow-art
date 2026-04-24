/**
 * End-to-end pipeline that turns synced PGNs into weaknesses.
 *
 * Steps:
 *   1. Read unanalyzed `user_games` rows for this user.
 *   2. Run client-side Stockfish (`gameAnalyzer.analyzeGame`) on each PGN.
 *   3. Bulk-insert the critical positions into `user_positions`.
 *   4. Mark each game as `analyzed = true`.
 *   5. Invoke the `detect-weaknesses` edge function to aggregate tags.
 *
 * The caller passes an `onProgress` callback so the UI can show real progress
 * instead of a fake timer.
 */
import { supabase } from "@/integrations/supabase/client";
import { analyzeGame, getPlayerColor } from "@/lib/gameAnalyzer";

export interface AnalyzeProgress {
  phase: "loading" | "analyzing" | "saving" | "detecting" | "done";
  gameIndex: number;
  totalGames: number;
  positionsFound: number;
  /** Username we matched against PGN headers (for debugging). */
  username: string | null;
}

export interface AnalyzeResult {
  gamesAnalyzed: number;
  positionsFound: number;
  weaknessesUpdated: number;
  /** True when there were no unanalyzed games to process. */
  alreadyAnalyzed: boolean;
}

const MAX_GAMES_PER_RUN = 30; // keep client analysis under a few minutes

export async function analyzeAndDetect(
  userId: string,
  onProgress?: (p: AnalyzeProgress) => void,
): Promise<AnalyzeResult> {
  onProgress?.({
    phase: "loading",
    gameIndex: 0,
    totalGames: 0,
    positionsFound: 0,
    username: null,
  });

  // 1. Fetch profile to learn the player's username on each platform.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("chesscom_username, lichess_username")
    .eq("user_id", userId)
    .maybeSingle();

  // 2. Pull unanalyzed games (cap to keep run-time bounded).
  const { data: games, error: gamesErr } = await supabase
    .from("user_games")
    .select("id, platform, pgn")
    .eq("user_id", userId)
    .eq("analyzed", false)
    .not("pgn", "is", null)
    .order("played_at", { ascending: false })
    .limit(MAX_GAMES_PER_RUN);

  if (gamesErr) throw gamesErr;

  if (!games || games.length === 0) {
    // Nothing to analyze — still re-detect to refresh aggregates.
    onProgress?.({
      phase: "detecting",
      gameIndex: 0,
      totalGames: 0,
      positionsFound: 0,
      username: null,
    });
    const { data: detectData } = await supabase.functions.invoke("detect-weaknesses");
    onProgress?.({
      phase: "done",
      gameIndex: 0,
      totalGames: 0,
      positionsFound: 0,
      username: null,
    });
    return {
      gamesAnalyzed: 0,
      positionsFound: 0,
      weaknessesUpdated: detectData?.weaknessesUpdated ?? 0,
      alreadyAnalyzed: true,
    };
  }

  let totalPositions = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const username =
      game.platform === "chesscom"
        ? profile?.chesscom_username
        : profile?.lichess_username;

    onProgress?.({
      phase: "analyzing",
      gameIndex: i,
      totalGames: games.length,
      positionsFound: totalPositions,
      username: username ?? null,
    });

    if (!game.pgn || !username) {
      // Mark as analyzed so we don't keep retrying broken rows.
      await supabase.from("user_games").update({ analyzed: true }).eq("id", game.id);
      continue;
    }

    try {
      const color = getPlayerColor(game.pgn, username);
      const positions = await analyzeGame(game.pgn, color);

      if (positions.length > 0) {
        const rows = positions.map((p) => ({
          user_id: userId,
          game_id: game.id,
          fen: p.fen,
          category: p.category,
          move_number: p.move_number,
          your_move_san: p.your_move_san,
          engine_best_san: p.engine_best_san,
          eval_before: p.eval_before,
          eval_after: p.eval_after,
          difficulty_score: p.difficulty_score,
        }));
        const { error: insErr } = await supabase.from("user_positions").insert(rows);
        if (insErr) console.warn("[analyzeAndDetect] insert positions failed", insErr);
        else totalPositions += positions.length;
      }

      await supabase.from("user_games").update({ analyzed: true }).eq("id", game.id);
    } catch (e) {
      console.warn("[analyzeAndDetect] game failed", game.id, e);
      // Don't mark as analyzed so a future run can retry.
    }
  }

  // 3. Roll up into weaknesses.
  onProgress?.({
    phase: "detecting",
    gameIndex: games.length,
    totalGames: games.length,
    positionsFound: totalPositions,
    username: null,
  });

  const { data: detectData, error: detectErr } = await supabase.functions.invoke(
    "detect-weaknesses",
  );
  if (detectErr) console.warn("[analyzeAndDetect] detect-weaknesses failed", detectErr);

  onProgress?.({
    phase: "done",
    gameIndex: games.length,
    totalGames: games.length,
    positionsFound: totalPositions,
    username: null,
  });

  return {
    gamesAnalyzed: games.length,
    positionsFound: totalPositions,
    weaknessesUpdated: detectData?.weaknessesUpdated ?? 0,
    alreadyAnalyzed: false,
  };
}