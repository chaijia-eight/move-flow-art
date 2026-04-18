/**
 * Game Review Classifier — wintrchess-style.
 * Ports core ideas from github.com/WintrCat/wintrchess (shared/src/lib/reporter):
 *  - Win-percentage from centipawns (sigmoid)
 *  - Per-move classification: brilliant / great / best / excellent / good /
 *    inaccuracy / mistake / blunder / book / forced
 *  - Per-side accuracy from win% deltas
 *
 * Inputs are produced by sampling Stockfish at every ply.
 */

import { Chess } from "chess.js";

export type Classification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "book"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "forced";

export const CLASSIFICATION_META: Record<
  Classification,
  { label: string; color: string; symbol: string; weight: number }
> = {
  brilliant:  { label: "Brilliant",  color: "#26c2a3", symbol: "!!", weight: 1.0 },
  great:      { label: "Great",      color: "#5b8baf", symbol: "!",  weight: 1.0 },
  best:       { label: "Best",       color: "#81b64c", symbol: "★",  weight: 1.0 },
  excellent:  { label: "Excellent",  color: "#81b64c", symbol: "",   weight: 0.95 },
  good:       { label: "Good",       color: "#95a472", symbol: "",   weight: 0.85 },
  book:       { label: "Book",       color: "#a88865", symbol: "📖", weight: 1.0 },
  inaccuracy: { label: "Inaccuracy", color: "#f7c948", symbol: "?!", weight: 0.5 },
  mistake:    { label: "Mistake",    color: "#ff9f1a", symbol: "?",  weight: 0.2 },
  blunder:    { label: "Blunder",    color: "#fa412d", symbol: "??", weight: 0.0 },
  forced:     { label: "Forced",     color: "#9aa0a6", symbol: "□",  weight: 1.0 },
};

export interface EvalScore {
  /** centipawns from White's perspective (positive = White better). null if mate. */
  cp: number | null;
  /** mate in N (positive = side-to-move mates). null if no forced mate. */
  mate: number | null;
}

export interface PositionEval {
  /** FEN BEFORE the move was played. */
  fenBefore: string;
  /** Move played in SAN. */
  san: string;
  /** Move played in UCI. */
  uci: string;
  /** Engine's top line for fenBefore (best move + its eval). */
  bestUci: string;
  bestSan: string;
  /** Eval BEFORE the move (from White's POV). */
  evalBefore: EvalScore;
  /** Eval AFTER the move (from White's POV). */
  evalAfter: EvalScore;
  /** Eval if best move had been played (from White's POV). */
  evalBest: EvalScore;
}

export interface ClassifiedMove extends PositionEval {
  classification: Classification;
  /** Who moved. */
  color: "w" | "b";
  /** Win % for the side that just moved, BEFORE the move. */
  winPctBefore: number;
  /** Win % for the side that just moved, AFTER the move. */
  winPctAfter: number;
}

export interface ReviewSummary {
  whiteAccuracy: number;
  blackAccuracy: number;
  counts: { white: Record<Classification, number>; black: Record<Classification, number> };
  moves: ClassifiedMove[];
}

// --- Win % from cp (wintrchess uses a logistic curve fitted on Lichess data) ----

/** Convert centipawn eval (white POV) to White's expected win percentage [0..100]. */
export function cpToWinPct(score: EvalScore): number {
  if (score.mate !== null) {
    return score.mate > 0 ? 100 : 0;
  }
  const cp = score.cp ?? 0;
  // Logistic curve, k tuned to roughly match wintrchess / lichess.
  // win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/** Win % from the perspective of the side that JUST moved (color). */
function winPctForMover(score: EvalScore, mover: "w" | "b"): number {
  const white = cpToWinPct(score);
  return mover === "w" ? white : 100 - white;
}

// --- Classification ----------------------------------------------------------

function evalsEqual(a: EvalScore, b: EvalScore): boolean {
  if (a.mate !== null && b.mate !== null) return a.mate === b.mate;
  if (a.mate !== null || b.mate !== null) return false;
  return (a.cp ?? 0) === (b.cp ?? 0);
}

/** Count legal moves at a position. Used to detect "forced" moves. */
function legalMoveCount(fen: string): number {
  try {
    return new Chess(fen).moves().length;
  } catch {
    return 0;
  }
}

/**
 * Detect a "brilliant" move: a sacrifice that is also the best (or near-best)
 * move and not in a totally lost position. Heuristic, not perfect.
 */
function isBrilliant(pos: PositionEval, mover: "w" | "b", winPctLossForMover: number): boolean {
  // Must be the engine's top move (or essentially equal to it)
  const playerWin = winPctForMover(pos.evalAfter, mover);
  const bestWin = winPctForMover(pos.evalBest, mover);
  if (bestWin - playerWin > 1.5) return false; // not best
  if (winPctLossForMover > 1) return false;

  // Position must not be losing already from the mover's POV
  const moverBefore = winPctForMover(pos.evalBefore, mover);
  if (moverBefore < 35) return false;

  // Must look like a sacrifice: piece moves to a square attacked by a lower-value piece,
  // OR it leaves a piece hanging that the opponent could capture next.
  try {
    const before = new Chess(pos.fenBefore);
    const move = before.move(pos.san);
    if (!move) return false;
    const after = new Chess(before.fen());

    // Compute attackers/defenders on `to`
    const attackers = after.attackers(move.to as any, mover === "w" ? "b" : "w");
    if (!attackers || attackers.length === 0) return false;

    const PIECE_VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const movedVal = PIECE_VAL[move.piece] ?? 0;
    if (movedVal < 3) return false; // pawn sac is rarely "brilliant" in our heuristic

    const defenders = after.attackers(move.to as any, mover);
    if (!defenders) return false;

    // If the piece is hanging (more attackers than defenders, or attacker is cheaper)
    const attackerVals = attackers.map((sq: string) => PIECE_VAL[after.get(sq as any)?.type ?? "p"]);
    const minAttacker = Math.min(...attackerVals);
    if (minAttacker < movedVal && defenders.length === 0) return true;
    if (attackers.length > defenders.length && minAttacker <= movedVal) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Detect a "great" move: the only move that holds the position (others lose
 * significantly), and the player found it.
 */
function isGreat(pos: PositionEval, mover: "w" | "b"): boolean {
  // Player chose the best (or near-best)
  const playerWin = winPctForMover(pos.evalAfter, mover);
  const bestWin = winPctForMover(pos.evalBest, mover);
  if (bestWin - playerWin > 2) return false;

  // We can't easily check second-best without sampling multipv; approximate by
  // "position before was critical": eval swung in a meaningful range.
  const before = winPctForMover(pos.evalBefore, mover);
  if (Math.abs(before - 50) > 35) return false; // not in a critical zone
  return false; // conservative — without multipv we usually can't prove "only move"
}

export function classifyMove(pos: PositionEval, color: "w" | "b"): Classification {
  // Forced: only one legal move
  if (legalMoveCount(pos.fenBefore) === 1) return "forced";

  // If played move is literally the engine's best move
  const isTopChoice = pos.uci === pos.bestUci || evalsEqual(pos.evalAfter, pos.evalBest);

  const winBefore = winPctForMover(pos.evalBefore, color);
  const winAfter = winPctForMover(pos.evalAfter, color);
  const winLoss = Math.max(0, winBefore - winAfter);

  if (isTopChoice) {
    if (isBrilliant(pos, color, winLoss)) return "brilliant";
    if (isGreat(pos, color)) return "great";
    return "best";
  }

  // Thresholds (win%) borrowed from wintrchess
  if (winLoss < 2) return "excellent";
  if (winLoss < 5) return "good";
  if (winLoss < 10) return "inaccuracy";
  if (winLoss < 20) return "mistake";
  return "blunder";
}

// --- Accuracy ---------------------------------------------------------------

/** Per-move accuracy [0..100] from a win% drop, using the wintrchess formula. */
function moveAccuracy(winBefore: number, winAfter: number): number {
  const drop = Math.max(0, winBefore - winAfter);
  // accuracy = 103.1668 * exp(-0.04354 * drop) - 3.1669
  const acc = 103.1668 * Math.exp(-0.04354 * drop) - 3.1669;
  return Math.max(0, Math.min(100, acc));
}

export function buildSummary(moves: ClassifiedMove[]): ReviewSummary {
  const emptyCounts = (): Record<Classification, number> => ({
    brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0,
    inaccuracy: 0, mistake: 0, blunder: 0, forced: 0,
  });
  const counts = { white: emptyCounts(), black: emptyCounts() };

  const whiteAccs: number[] = [];
  const blackAccs: number[] = [];

  for (const m of moves) {
    counts[m.color === "w" ? "white" : "black"][m.classification] += 1;
    const acc = moveAccuracy(m.winPctBefore, m.winPctAfter);
    if (m.color === "w") whiteAccs.push(acc);
    else blackAccs.push(acc);
  }

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return {
    whiteAccuracy: Math.round(avg(whiteAccs) * 10) / 10,
    blackAccuracy: Math.round(avg(blackAccs) * 10) / 10,
    counts,
    moves,
  };
}
