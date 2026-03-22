/**
 * Stockfish WASM Engine Wrapper
 * Communicates with Stockfish via UCI protocol in a Web Worker.
 */

export interface EngineEvaluation {
  bestMove: string; // e.g. "e2e4"
  score: number; // centipawns from current side's perspective
  depth: number;
  mate: number | null; // mate in N moves, null if no forced mate
  pv: string[]; // principal variation
}

export interface MoveEvaluation {
  isGood: boolean;
  scoreDiff: number; // centipawn loss compared to best move
  bestMove: string;
  bestMoveSan: string;
  playerMoveScore: number;
  bestMoveScore: number;
  explanation: string;
}

const GOOD_MOVE_THRESHOLD = 80; // centipawn loss threshold — moves losing less than this are "good"

class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private messageCallbacks: ((line: string) => void)[] = [];
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      try {
        this.worker = new Worker("/stockfish/stockfish.js");
        
        this.worker.onmessage = (e) => {
          const line = typeof e.data === "string" ? e.data : e.data?.toString?.() ?? "";
          for (const cb of this.messageCallbacks) {
            cb(line);
          }
        };

        this.worker.onerror = (err) => {
          console.error("Stockfish worker error:", err);
          reject(err);
        };

        // Wait for UCI initialization
        this.sendAndWait("uci", "uciok").then(() => {
          this.ready = true;
          this.send("isready");
          return this.waitFor("readyok");
        }).then(() => {
          resolve();
        }).catch(reject);
      } catch (err) {
        reject(err);
      }
    });

    return this.initPromise;
  }

  private send(command: string) {
    this.worker?.postMessage(command);
  }

  private waitFor(token: string, timeout = 10000): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const lines: string[] = [];
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Stockfish timeout waiting for "${token}"`));
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
        this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);
      };

      this.messageCallbacks.push(handler);
    });
  }

  private async sendAndWait(command: string, token: string, timeout = 10000): Promise<string[]> {
    const promise = this.waitFor(token, timeout);
    this.send(command);
    return promise;
  }

  async evaluate(fen: string, depth = 14): Promise<EngineEvaluation> {
    await this.init();
    
    this.send("ucinewgame");
    await this.sendAndWait("isready", "readyok");
    
    this.send(`position fen ${fen}`);
    const lines = await this.sendAndWait(`go depth ${depth}`, "bestmove");

    let bestMove = "";
    let score = 0;
    let mate: number | null = null;
    let pv: string[] = [];
    let bestDepth = 0;

    for (const line of lines) {
      if (line.startsWith("bestmove")) {
        bestMove = line.split(" ")[1] || "";
      }
      
      if (line.startsWith("info") && line.includes("score") && !line.includes("upperbound") && !line.includes("lowerbound")) {
        const depthMatch = line.match(/depth (\d+)/);
        const d = depthMatch ? parseInt(depthMatch[1]) : 0;
        
        if (d >= bestDepth) {
          bestDepth = d;
          
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          
          if (cpMatch) {
            score = parseInt(cpMatch[1]);
            mate = null;
          } else if (mateMatch) {
            mate = parseInt(mateMatch[1]);
            score = mate > 0 ? 10000 : -10000;
          }

          const pvMatch = line.match(/pv (.+)/);
          if (pvMatch) {
            pv = pvMatch[1].split(" ");
          }
        }
      }
    }

    return { bestMove, score, depth: bestDepth, mate, pv };
  }

  /**
   * Evaluate a specific move by comparing it to the engine's best move.
   * Returns whether the move is "good" (within threshold) and the score difference.
   */
  async evaluateMove(fen: string, moveUci: string, moveSan: string, depth = 14): Promise<MoveEvaluation> {
    // First get the best move evaluation
    const bestEval = await this.evaluate(fen, depth);

    // Now evaluate the position after the player's move
    const { Chess } = await import("chess.js");
    const chess = new Chess(fen);
    const isWhiteTurn = chess.turn() === "w";
    
    // Make the player's move to get the resulting FEN
    const from = moveUci.slice(0, 2);
    const to = moveUci.slice(2, 4);
    const promotion = moveUci.length > 4 ? moveUci[4] : undefined;
    
    const moveResult = chess.move({ from, to, promotion });
    if (!moveResult) {
      return {
        isGood: false,
        scoreDiff: 999,
        bestMove: bestEval.bestMove,
        bestMoveSan: "",
        playerMoveScore: -9999,
        bestMoveScore: bestEval.score,
        explanation: "Invalid move.",
      };
    }

    const afterFen = chess.fen();
    
    // Evaluate the resulting position (from opponent's perspective, so negate)
    const afterEval = await this.evaluate(afterFen, depth);
    const playerMoveScore = -afterEval.score; // Negate because it's now opponent's turn
    
    // Get best move in SAN
    const chess2 = new Chess(fen);
    let bestMoveSan = "";
    try {
      const bFrom = bestEval.bestMove.slice(0, 2);
      const bTo = bestEval.bestMove.slice(2, 4);
      const bPromo = bestEval.bestMove.length > 4 ? bestEval.bestMove[4] : undefined;
      const bResult = chess2.move({ from: bFrom, to: bTo, promotion: bPromo });
      if (bResult) bestMoveSan = bResult.san;
    } catch {
      bestMoveSan = bestEval.bestMove;
    }

    const scoreDiff = bestEval.score - playerMoveScore;
    const isGood = scoreDiff <= GOOD_MOVE_THRESHOLD;

    let explanation = "";
    if (isGood) {
      if (scoreDiff <= 10) {
        explanation = "This is an excellent move!";
      } else {
        explanation = `Good move. The engine's top choice is ${bestMoveSan}, but your move is solid too.`;
      }
    } else {
      if (bestEval.mate !== null && bestEval.mate > 0) {
        explanation = `There's a forced mate with ${bestMoveSan}. Your move misses it.`;
      } else if (scoreDiff > 200) {
        explanation = `This move loses significant material or positional advantage. ${bestMoveSan} is much better here.`;
      } else {
        explanation = `This move is inaccurate, losing about ${(scoreDiff / 100).toFixed(1)} pawns worth of advantage. ${bestMoveSan} is stronger.`;
      }
    }

    return {
      isGood,
      scoreDiff,
      bestMove: bestEval.bestMove,
      bestMoveSan,
      playerMoveScore,
      bestMoveScore: bestEval.score,
      explanation,
    };
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.initPromise = null;
    this.messageCallbacks = [];
  }
}

// Singleton instance
let instance: StockfishEngine | null = null;

export function getEngine(): StockfishEngine {
  if (!instance) {
    instance = new StockfishEngine();
  }
  return instance;
}

export function destroyEngine() {
  instance?.destroy();
  instance = null;
}
