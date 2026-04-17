/**
 * Move Coach — powered by WintrChess observation system.
 * 
 * Uses wintrchess/engine for Stockfish analysis and wintrchess/coach
 * for rich position observations and prompt building.
 * LLM calls go through our ai-coach edge function (server-side).
 */

import { BrowserEngine } from "wintrchess/engine";
import { Coach } from "wintrchess/coach";
import { Chess, parseUci, type NormalMove } from "chessops";
import { parseFen } from "chessops/fen";

// Singleton analysis engine (separate from game engine)
let analysisEngine: BrowserEngine | null = null;
let coach: Coach | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the wintrchess Coach with a dedicated analysis Stockfish worker.
 */
async function ensureCoach(): Promise<Coach> {
  if (coach) return coach;

  if (initPromise) {
    await initPromise;
    return coach!;
  }

  initPromise = (async () => {
    const sfUrl = `/stockfish/stockfish-single.js#${encodeURIComponent("/stockfish/stockfish.wasm")}`;
    analysisEngine = await BrowserEngine.create(sfUrl);

    // Create coach with dummy LLM config — we only use createAssessment(),
    // not createExplanation(). Our edge function handles the LLM part.
    coach = new Coach({
      engine: analysisEngine,
      llm: {
        apiKey: "not-used",
        dangerouslyAllowBrowser: true,
      },
    });
  })();

  await initPromise;
  return coach!;
}

/**
 * Convert FEN + SAN to chessops ContextualMove using chess.js for SAN parsing.
 */
async function getContextualMove(fenBefore: string, san: string) {
  // Use chess.js to resolve SAN → UCI
  const { Chess: CJS } = await import("chess.js");
  const game = new CJS(fenBefore);
  const result = game.move(san);
  if (!result) return null;

  const uci = result.from + result.to + (result.promotion || "");
  const move = parseUci(uci) as NormalMove | undefined;
  if (!move) return null;

  // Build the chessops position (before move)
  const setupResult = parseFen(fenBefore);
  if (setupResult.isErr) return null;
  const posResult = Chess.fromSetup(setupResult.unwrap());
  if (posResult.isErr) return null;
  const position = posResult.unwrap();

  // Get piece and capture info from chessops
  const piece = position.board.get(move.from);
  if (!piece) return null;
  const capturedPiece = position.board.get(move.to);

  // Apply move to get after-position
  const afterPosition = position.clone();
  afterPosition.play(move);

  return {
    position,       // before move
    afterPosition,  // after move
    move: {
      ...move,
      piece,
      captured: capturedPiece ? { ...capturedPiece, square: move.to } : undefined,
    },
  };
}

/**
 * Generate a rich explanation using wintrchess observations + our LLM edge function.
 */
export async function generateCoachExplanation(
  fenBefore: string,
  san: string,
  isPlayerMove: boolean,
  moveNumber: number,
  playerColor: "w" | "b"
): Promise<string> {
  try {
    const coachInstance = await ensureCoach();

    // Parse the move
    const moveData = await getContextualMove(fenBefore, san);
    if (!moveData) {
      return fallbackExplanation(san, isPlayerMove);
    }

    // Create assessment using wintrchess's full observation pipeline
    // (runs Stockfish evaluation + 12 observation functions)
    const assessment = await coachInstance.createAssessment({
      position: moveData.afterPosition,
      move: moveData.move as any,
      evaluations: { depth: 12, timeLimit: 2000 },
    });

    // Build our own user prompt — wintrchess prompts use White/Black which leaks.
    // Edge function constructs the system prompt based on isPlayerMove.
    const factsBlock = assessment.statements.length
      ? assessment.statements.map((s) => `- ${s}`).join("\n")
      : "- (no special engine observations)";

    const sideLabel = isPlayerMove
      ? `you (the student, playing ${playerColor === "w" ? "White" : "Black"})`
      : `I (the coach / engine, playing ${playerColor === "w" ? "Black" : "White"})`;

    const userPrompt = `Move ${moveNumber}: ${san}
Played by: ${sideLabel}

Engine observations:
${factsBlock}

Explain this move in 2-4 sentences. If it was a blunder, mistake, or inaccuracy, SAY SO and explain WHAT was lost or missed (hung piece, tactic, better square). If it was strong, say WHY. Speak naturally with I / you — never use the words "White" or "Black".`;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        userPrompt,
        rawFacts: assessment.statements.join(" "),
        isPlayerMove,
        playerColor,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.explanation || assessment.statements.join(" ") || `Plays ${san}.`;
    }
  } catch (err) {
    console.warn("WintrChess coach error, using fallback:", err);
  }

  return fallbackExplanation(san, isPlayerMove);
}

/**
 * Simple fallback when wintrchess pipeline fails.
 */
function fallbackExplanation(san: string, isPlayerMove: boolean): string {
  return isPlayerMove ? `You played ${san}.` : `I played ${san}.`;
}

/**
 * Destroy the analysis engine and coach.
 */
export function destroyCoach() {
  analysisEngine?.terminate();
  analysisEngine = null;
  coach = null;
  initPromise = null;
}

// Backward-compatible exports for any code that still uses these
export function observeMove(_fenBefore: string, san: string) {
  return [{ text: `Plays ${san}.`, type: "positional" as const, priority: 1 }];
}

export function buildRawExplanation(observations: { text: string }[]): string {
  return observations.map(o => o.text).join(" ");
}
