import { Chess } from "chess.js";

export interface LichessPuzzle {
  id: string;
  rating: number;
  themes: string[];
  /** FEN of the position the user is solving FROM (after the setup move). */
  startFen: string;
  /** Solution moves in UCI, starting with the user's first move. */
  solutionUci: string[];
  /** Solution moves in SAN (parallel to solutionUci), from startFen. */
  solutionSan: string[];
  /** Side to move at startFen ("w" or "b"). */
  sideToMove: "w" | "b";
}

type Difficulty = "easiest" | "easier" | "normal" | "harder" | "hardest";

export function offsetToDifficulty(offset: number): Difficulty {
  if (offset <= -250) return "easiest";
  if (offset <= -75) return "easier";
  if (offset >= 250) return "hardest";
  if (offset >= 75) return "harder";
  return "normal";
}

/**
 * Fetch the next puzzle from Lichess. Optional difficulty/angle.
 * Docs: https://lichess.org/api#tag/Puzzles
 */
export async function fetchLichessPuzzle(
  difficulty: Difficulty = "normal",
): Promise<LichessPuzzle> {
  const url = `https://lichess.org/api/puzzle/next?difficulty=${difficulty}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Lichess puzzle fetch failed: ${res.status}`);
  }
  const data = await res.json();

  const pgn: string = data.game?.pgn ?? "";
  const initialPly: number = data.puzzle?.initialPly ?? 0;
  const solutionUci: string[] = data.puzzle?.solution ?? [];
  const id: string = data.puzzle?.id ?? "unknown";
  const rating: number = data.puzzle?.rating ?? 1500;
  const themes: string[] = data.puzzle?.themes ?? [];

  // Replay the PGN up to initialPly + 1 (we include the setup move so the
  // user solves FROM the position right after it).
  const chess = new Chess();
  // Lichess returns space-separated UCI-like SAN moves in the `pgn` field.
  // Use loadPgn for safety — it accepts the SAN list.
  // The pgn is just moves separated by spaces, no headers.
  const moves = pgn.trim().split(/\s+/).filter(Boolean);
  // Play moves up to and including the setup move (initialPly is 0-indexed
  // ply count BEFORE the setup move; the setup move is at index initialPly).
  const playUpTo = initialPly + 1;
  for (let i = 0; i < Math.min(playUpTo, moves.length); i++) {
    try {
      chess.move(moves[i]);
    } catch {
      // Stop if a move fails — we'll use whatever position we have.
      break;
    }
  }

  const startFen = chess.fen();
  const sideToMove = startFen.split(" ")[1] === "w" ? "w" : "b";

  // Convert solution UCI -> SAN by playing them on a clone.
  const solutionSan: string[] = [];
  const clone = new Chess(startFen);
  for (const uci of solutionUci) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
    try {
      const m = clone.move({ from, to, promotion: promotion as any });
      solutionSan.push(m.san);
    } catch {
      break;
    }
  }

  return {
    id,
    rating,
    themes,
    startFen,
    solutionUci,
    solutionSan,
    sideToMove,
  };
}

export function normalizeSan(s: string): string {
  return s.replace(/[+#]/g, "");
}
