/**
 * Analyzes a PGN with Stockfish, returning per-ply evaluations + classifications.
 * Used by the Game Review page.
 */

import { Chess } from "chess.js";
import { getEngine } from "./stockfishEngine";
import {
  buildSummary,
  classifyMove,
  cpToWinPct,
  type ClassifiedMove,
  type EvalScore,
  type PositionEval,
  type ReviewSummary,
} from "./reviewClassifier";

export interface ReviewProgress {
  ply: number;
  totalPlies: number;
}

function evalToScore(e: { score: number; mate: number | null }, sideToMove: "w" | "b"): EvalScore {
  // Stockfish returns score from side-to-move POV. Normalize to White POV.
  if (e.mate !== null) {
    return { cp: null, mate: sideToMove === "w" ? e.mate : -e.mate };
  }
  return { cp: sideToMove === "w" ? e.score : -e.score, mate: null };
}

export async function analyzePgnForReview(
  pgn: string,
  onProgress?: (p: ReviewProgress) => void,
  depth = 12,
): Promise<ReviewSummary> {
  const engine = getEngine();
  await engine.init();

  const game = new Chess();
  try {
    game.loadPgn(pgn, { strict: false } as any);
  } catch {
    throw new Error("Invalid PGN");
  }
  const history = game.history({ verbose: true });
  if (history.length === 0) throw new Error("No moves found in PGN");

  const replay = new Chess();
  const positions: PositionEval[] = [];
  const moveColors: ("w" | "b")[] = [];

  // Pre-compute eval for the starting position once
  const startSideToMove = replay.turn();
  const startEval = await engine.evaluate(replay.fen(), depth);
  let prevEval: EvalScore = evalToScore(
    { score: startEval.score, mate: startEval.mate },
    startSideToMove,
  );
  let prevBestUci = startEval.bestMove;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = replay.fen();
    const sideToMove = replay.turn();

    // evalBefore = the eval of fenBefore (already computed as prevEval / prevBestUci)
    const evalBefore = prevEval;

    // Determine SAN of the engine's best move from fenBefore
    let bestSan = prevBestUci;
    try {
      const tmp = new Chess(fenBefore);
      const bFrom = prevBestUci.slice(0, 2);
      const bTo = prevBestUci.slice(2, 4);
      const bPromo = prevBestUci.length > 4 ? prevBestUci[4] : undefined;
      const r = tmp.move({ from: bFrom, to: bTo, promotion: bPromo as any });
      if (r) bestSan = r.san;
    } catch {/* keep uci */}

    // Apply the actual move
    const uci = move.from + move.to + (move.promotion ?? "");
    replay.move(move.san);
    const fenAfter = replay.fen();

    // Eval after the move
    const afterRaw = await engine.evaluate(fenAfter, depth);
    const evalAfter = evalToScore({ score: afterRaw.score, mate: afterRaw.mate }, replay.turn());

    // For "best move continuation" eval, approximate: if player picked top move,
    // evalBest ≈ evalAfter; otherwise we use evalBefore (engine's expected value
    // assuming best play). This avoids a second engine call per ply.
    const evalBest: EvalScore = uci === prevBestUci
      ? evalAfter
      : evalBefore;

    positions.push({
      fenBefore,
      san: move.san,
      uci,
      bestUci: prevBestUci,
      bestSan,
      evalBefore,
      evalAfter,
      evalBest,
    });
    moveColors.push(sideToMove);

    // Roll forward: prevEval/prevBestUci become the after-position's engine view
    prevEval = evalAfter;
    prevBestUci = afterRaw.bestMove;

    onProgress?.({ ply: i + 1, totalPlies: history.length });
  }

  const classified: ClassifiedMove[] = positions.map((p, idx) => {
    const color = moveColors[idx];
    return {
      ...p,
      color,
      classification: classifyMove(p, color),
      winPctBefore: color === "w" ? cpToWinPct(p.evalBefore) : 100 - cpToWinPct(p.evalBefore),
      winPctAfter: color === "w" ? cpToWinPct(p.evalAfter) : 100 - cpToWinPct(p.evalAfter),
    };
  });

  return buildSummary(classified);
}
