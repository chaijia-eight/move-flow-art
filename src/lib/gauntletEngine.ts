/**
 * Gauntlet Engine — plays a full game vs Stockfish at a target ELO.
 * Uses UCI_LimitStrength + UCI_Elo to cap engine strength.
 */

import { Chess } from "chess.js";

export interface GauntletEngine {
  game: Chess;
  makeEngineMove: () => Promise<{ from: string; to: string; san: string } | null>;
  makePlayerMove: (from: string, to: string, promotion?: string) => { san: string } | null;
  destroy: () => void;
  getFen: () => string;
  isGameOver: () => boolean;
  getResult: () => "win" | "loss" | "draw" | null;
  playerColor: "w" | "b";
}

const STOCKFISH_ELO_MIN = 1320;
const STOCKFISH_ELO_MAX = 3190;

export async function fetchPlayerRating(
  chesscomUsername?: string | null,
  lichessUsername?: string | null
): Promise<number | null> {
  let chesscomRating: number | null = null;
  let lichessRating: number | null = null;

  if (chesscomUsername) {
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${chesscomUsername}/stats`);
      if (res.ok) {
        const data = await res.json();
        chesscomRating =
          data?.chess_rapid?.last?.rating ??
          data?.chess_blitz?.last?.rating ??
          data?.chess_bullet?.last?.rating ??
          null;
      }
    } catch {
      /* silent */
    }
  }

  if (lichessUsername) {
    try {
      const res = await fetch(`https://lichess.org/api/user/${lichessUsername}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        lichessRating = data?.perfs?.rapid?.rating ?? data?.perfs?.blitz?.rating ?? null;
      }
    } catch {
      /* silent */
    }
  }

  // Normalize: Lichess ratings are ~250 higher than Chess.com
  const normalizedLichess = lichessRating ? lichessRating - 250 : null;

  if (chesscomRating && normalizedLichess) {
    return Math.max(chesscomRating, normalizedLichess);
  }
  return chesscomRating ?? normalizedLichess ?? null;
}

export function calculateTargetElo(playerRating: number): number {
  const target = playerRating + 100;
  return Math.max(STOCKFISH_ELO_MIN, Math.min(STOCKFISH_ELO_MAX, target));
}

export async function createGauntletEngine(
  targetElo: number,
  playerColor: "w" | "b"
): Promise<GauntletEngine> {
  const game = new Chess();

  // Create a dedicated worker for this game
  const worker = new Worker(`/stockfish/stockfish-single.js#${encodeURIComponent("/stockfish/stockfish.wasm")}`);

  const messageCallbacks: ((line: string) => void)[] = [];

  worker.onmessage = (e) => {
    const line = typeof e.data === "string" ? e.data : e.data?.toString?.() ?? "";
    for (const cb of messageCallbacks) cb(line);
  };

  const waitFor = (token: string, timeout = 30000): Promise<string[]> =>
    new Promise((resolve, reject) => {
      const lines: string[] = [];
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for ${token}`));
      }, timeout);
      const handler = (line: string) => {
        lines.push(line);
        if (line.includes(token)) {
          cleanup();
          resolve(lines);
        }
      };
      const cleanup = () => {
        clearTimeout(timer);
        const idx = messageCallbacks.indexOf(handler);
        if (idx >= 0) messageCallbacks.splice(idx, 1);
      };
      messageCallbacks.push(handler);
    });

  const send = (cmd: string) => worker.postMessage(cmd);

  const sendAndWait = async (cmd: string, token: string, timeout = 30000) => {
    const p = waitFor(token, timeout);
    send(cmd);
    return p;
  };

  // Initialize UCI
  await sendAndWait("uci", "uciok", 30000);

  // Set ELO-limited strength
  send(`setoption name UCI_LimitStrength value true`);
  send(`setoption name UCI_Elo value ${targetElo}`);

  await sendAndWait("isready", "readyok");

  const makeEngineMove = async (): Promise<{ from: string; to: string; san: string } | null> => {
    if (game.isGameOver()) return null;

    send("ucinewgame");
    await sendAndWait("isready", "readyok");
    send(`position fen ${game.fen()}`);

    const lines = await sendAndWait("go movetime 1500", "bestmove", 15000);

    let bestMoveUci = "";
    for (const line of lines) {
      if (line.startsWith("bestmove")) {
        bestMoveUci = line.split(" ")[1] || "";
        break;
      }
    }

    if (!bestMoveUci || bestMoveUci === "(none)") return null;

    const from = bestMoveUci.slice(0, 2);
    const to = bestMoveUci.slice(2, 4);
    const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

    try {
      const move = game.move({ from, to, promotion });
      if (move) return { from: move.from, to: move.to, san: move.san };
    } catch {
      /* invalid move from engine */
    }
    return null;
  };

  const makePlayerMove = (from: string, to: string, promotion?: string) => {
    try {
      const move = game.move({ from, to, promotion });
      if (move) return { san: move.san };
    } catch {
      /* invalid */
    }
    return null;
  };

  const getResult = (): "win" | "loss" | "draw" | null => {
    if (!game.isGameOver()) return null;
    if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
      return "draw";
    }
    if (game.isCheckmate()) {
      // The side whose turn it is has been checkmated
      const loser = game.turn();
      return loser === playerColor ? "loss" : "win";
    }
    return "draw";
  };

  return {
    game,
    makeEngineMove,
    makePlayerMove,
    destroy: () => worker.terminate(),
    getFen: () => game.fen(),
    isGameOver: () => game.isGameOver(),
    getResult,
    playerColor,
  };
}
