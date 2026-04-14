/**
 * Game Analysis Service
 * Processes PGN games using Stockfish to extract critical positions
 * (blunders, missed tactics, defensive cruxes, endgame technique).
 */

import { getEngine } from "./stockfishEngine";

export interface AnalysisPosition {
  fen: string;
  category: "blunder" | "missed_tactic" | "defensive_crux" | "endgame_tech";
  move_number: number;
  your_move_san: string;
  engine_best_san: string;
  eval_before: number; // centipawns
  eval_after: number;
  difficulty_score: number; // 1-10
}

export interface AnalysisProgress {
  gameIndex: number;
  totalGames: number;
  moveIndex: number;
  totalMoves: number;
  currentGame: string; // opponent name
  phase: "starting" | "analyzing" | "saving" | "done";
}

type ProgressCallback = (progress: AnalysisProgress) => void;

// Thresholds in centipawns
const BLUNDER_THRESHOLD = 200; // losing 2+ pawns
const INACCURACY_THRESHOLD = 80; // losing 0.8+ pawns
const TACTIC_SWING = 150; // position swings 1.5+ pawns in your favour if best move played

function countPieces(fen: string): number {
  const board = fen.split(" ")[0];
  return (board.match(/[rnbqkpRNBQKP]/g) || []).length;
}

function isEndgame(fen: string): boolean {
  const board = fen.split(" ")[0];
  const queens = (board.match(/[qQ]/g) || []).length;
  const pieces = countPieces(fen);
  return pieces <= 12 || (queens === 0 && pieces <= 16);
}

/**
 * Classify a position based on eval swing
 */
function classifyPosition(
  evalBefore: number,
  evalAfter: number,
  bestEval: number,
  fen: string,
  isPlayerWhite: boolean,
): AnalysisPosition["category"] | null {
  // Normalize to player's perspective
  const playerBefore = isPlayerWhite ? evalBefore : -evalBefore;
  const playerAfter = isPlayerWhite ? evalAfter : -evalAfter;
  const playerBest = isPlayerWhite ? bestEval : -bestEval;

  const cpLoss = playerBefore - playerAfter;
  const missedGain = playerBest - playerAfter;

  if (isEndgame(fen) && cpLoss >= INACCURACY_THRESHOLD) {
    return "endgame_tech";
  }

  if (cpLoss >= BLUNDER_THRESHOLD) {
    return "blunder";
  }

  // If the player was worse but had a tactical shot
  if (playerBefore <= -50 && missedGain >= TACTIC_SWING) {
    return "missed_tactic";
  }

  // If the player was better but the best move was a complex defensive resource
  if (playerBefore >= 50 && cpLoss >= INACCURACY_THRESHOLD && missedGain >= TACTIC_SWING) {
    return "missed_tactic";
  }

  // Defensive crux: player is worse and there's one saving move
  if (playerBefore <= -100 && cpLoss >= INACCURACY_THRESHOLD) {
    return "defensive_crux";
  }

  return null; // not interesting enough
}

function difficultyScore(cpLoss: number): number {
  return Math.min(10, Math.max(1, Math.round(cpLoss / 50)));
}

/**
 * Analyze a single game PGN and return critical positions.
 * Uses depth 10 for speed (analyzing many moves).
 */
export async function analyzeGame(
  pgn: string,
  playerColor: "w" | "b",
  onMoveProgress?: (moveIdx: number, totalMoves: number) => void,
): Promise<AnalysisPosition[]> {
  const { Chess } = await import("chess.js");
  const engine = getEngine();
  await engine.init();

  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    console.warn("Failed to parse PGN, skipping game");
    return [];
  }

  // Get all moves
  const moves = chess.history({ verbose: true });
  if (moves.length < 6) return []; // too short

  const positions: AnalysisPosition[] = [];
  const replay = new Chess();
  const DEPTH = 10; // fast but reasonable

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const fen = replay.fen();
    const turn = replay.turn();

    // Only analyze the player's moves
    if (turn === playerColor) {
      onMoveProgress?.(i, moves.length);

      try {
        // Eval before player's move (what engine thinks of the position)
        const evalBefore = await engine.evaluate(fen, DEPTH);

        // Make the player's move
        replay.move(move.san);
        const fenAfter = replay.fen();

        // Eval after player's move (from opponent's perspective, negate)
        const evalAfterRaw = await engine.evaluate(fenAfter, DEPTH);
        const evalAfterScore = -evalAfterRaw.score;

        // Get best move SAN
        let bestSan = "";
        try {
          const tmp = new Chess(fen);
          const bFrom = evalBefore.bestMove.slice(0, 2);
          const bTo = evalBefore.bestMove.slice(2, 4);
          const bPromo = evalBefore.bestMove.length > 4 ? evalBefore.bestMove[4] : undefined;
          const r = tmp.move({ from: bFrom, to: bTo, promotion: bPromo });
          if (r) bestSan = r.san;
        } catch {
          bestSan = evalBefore.bestMove;
        }

        const category = classifyPosition(
          evalBefore.score,
          evalAfterScore,
          evalBefore.score, // best eval is the eval before (engine's best)
          fen,
          playerColor === "w",
        );

        if (category) {
          const cpLoss = Math.abs(
            (playerColor === "w" ? evalBefore.score : -evalBefore.score) -
            (playerColor === "w" ? evalAfterScore : -evalAfterScore)
          );

          positions.push({
            fen,
            category,
            move_number: Math.floor(i / 2) + 1,
            your_move_san: move.san,
            engine_best_san: bestSan,
            eval_before: evalBefore.score / 100,
            eval_after: evalAfterScore / 100,
            difficulty_score: difficultyScore(cpLoss),
          });
        }
      } catch (err) {
        console.warn(`Engine error at move ${i}, skipping:`, err);
        replay.move(move.san);
      }
    } else {
      replay.move(move.san);
    }
  }

  return positions;
}

/**
 * Determine the player's color from a PGN given their username.
 */
export function getPlayerColor(pgn: string, username: string): "w" | "b" {
  const lower = username.toLowerCase();
  const whiteMatch = pgn.match(/\[White\s+"([^"]+)"\]/i);
  const blackMatch = pgn.match(/\[Black\s+"([^"]+)"\]/i);

  if (whiteMatch && whiteMatch[1].toLowerCase() === lower) return "w";
  if (blackMatch && blackMatch[1].toLowerCase() === lower) return "b";

  // Fallback: check if username appears in White header
  if (whiteMatch && whiteMatch[1].toLowerCase().includes(lower)) return "w";
  return "b";
}
