/**
 * Move Coach — powered by WintrChess observation system.
 * 
 * Uses wintrchess/engine for Stockfish analysis and wintrchess/coach
 * for rich position observations and prompt building.
 * LLM calls go through our ai-coach edge function (server-side).
 */

import { BrowserEngine } from "wintrchess/engine";
import {
  Coach,
  buildSystemPrompt,
  buildUserPrompt,
} from "wintrchess/coach";
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

    // Build prompts using wintrchess's prompt builders
    const person = isPlayerMove ? "second" : "first";
    const systemPrompt = buildSystemPrompt({
      person,
      personality: "a friendly, encouraging chess coach who speaks casually",
      additionalPrompt: "Keep your response to 2-3 sentences maximum. Be concise and natural. Never say White or Black — use I/you.",
    });
    const userPrompt = buildUserPrompt(assessment);

    // Send to our edge function for LLM processing
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        rawFacts: assessment.statements.join(" "),
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
