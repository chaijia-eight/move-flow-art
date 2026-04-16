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
  type AssessmentContext,
  type AssessmentNode,
} from "wintrchess/coach";
import { Chess } from "chessops";
import { parseFen } from "chessops/fen";
import { parseUci, type NormalMove } from "chessops";

// Singleton analysis engine (separate from game engine)
let analysisEngine: BrowserEngine | null = null;
let coach: Coach | null = null;
let initPromise: Promise<void> | null = null;

// Cache last context for efficiency
let lastContext: AssessmentContext | undefined;

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

    // Create coach with dummy LLM config — we won't use Coach.createExplanation()
    // We only use createAssessment() + our own edge function for LLM
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
 * Convert a FEN + SAN move into chessops Position + ContextualMove
 */
function fenAndSanToChessops(fen: string, san?: string) {
  const setup = parseFen(fen);
  if (setup.isErr) throw new Error(`Invalid FEN: ${fen}`);
  const pos = Chess.fromSetup(setup.unwrap());
  if (pos.isErr) throw new Error(`Invalid position`);
  const position = pos.unwrap();

  if (!san) return { position, move: undefined };

  // Convert SAN to UCI then to chessops NormalMove
  // We need to find the matching legal move
  const { Chess: ChessJS } = await import("chess.js") as any;
  // Actually, let's use chess.js to get the UCI notation from SAN
  return { position, move: undefined }; // placeholder
}

/**
 * Convert FEN + SAN to chessops ContextualMove using chess.js for SAN parsing.
 */
async function getContextualMove(fenBefore: string, san: string) {
  const { Chess: CJS } = await import("chess.js");
  const game = new CJS(fenBefore);
  const result = game.move(san);
  if (!result) return null;

  const uci = result.from + result.to + (result.promotion || "");
  const move = parseUci(uci) as NormalMove | undefined;
  if (!move) return null;

  // Build the chessops position
  const setup = parseFen(fenBefore);
  if (setup.isErr) return null;
  const pos = Chess.fromSetup(setup.unwrap());
  if (pos.isErr) return null;
  const position = pos.unwrap();

  // Contextualize the move
  const piece = position.board.get(move.from);
  if (!piece) return null;

  // Get captured piece
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
      return fallbackExplanation(fenBefore, san, isPlayerMove);
    }

    // Create assessment using wintrchess's full observation pipeline
    const assessment = await coachInstance.createAssessment({
      position: moveData.afterPosition,
      move: moveData.move as any,
      evaluations: { depth: 12, timeLimit: 2000 },
    });

    // Cache context for next move
    lastContext = assessment.context;

    // Build prompts using wintrchess's prompt builders
    const person = isPlayerMove ? "second" : "first";
    const systemPrompt = buildSystemPrompt({
      person,
      personality: "a friendly, encouraging chess coach who speaks casually",
      additionalPrompt: "Keep your response to 2-3 sentences maximum. Be concise and natural.",
    });
    const userPrompt = buildUserPrompt(assessment);

    // Send to our edge function
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

  return fallbackExplanation(fenBefore, san, isPlayerMove);
}

/**
 * Simple fallback when wintrchess pipeline fails.
 */
function fallbackExplanation(fen: string, san: string, isPlayerMove: boolean): string {
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
  lastContext = undefined;
}

// Keep backward-compatible exports
export function observeMove(fenBefore: string, san: string) {
  return [{ text: `Plays ${san}.`, type: "positional" as const, priority: 1 }];
}

export function buildRawExplanation(observations: { text: string }[]): string {
  return observations.map(o => o.text).join(" ");
}
