/**
 * Move Coach — generates natural language explanations for chess moves.
 * 
 * Stage 1: Concrete observations (hand-written chess logic)
 * Stage 2: LLM stitching via Lovable AI Gateway
 */

import { Chess, type Square } from "chess.js";

const CENTER_SQUARES: Square[] = ["d4", "d5", "e4", "e5"];
const EXTENDED_CENTER: Square[] = ["c3", "c4", "c5", "c6", "d3", "d6", "e3", "e6", "f3", "f4", "f5", "f6"];

interface Observation {
  text: string;
  type: "positional" | "tactical" | "development" | "safety" | "material";
}

/**
 * Generate concrete, factual observations about a move.
 */
export function observeMove(fenBefore: string, san: string): Observation[] {
  const observations: Observation[] = [];
  const before = new Chess(fenBefore);
  const turn = before.turn(); // who is moving

  // Play the move
  const after = new Chess(fenBefore);
  let move;
  try {
    move = after.move(san);
  } catch {
    return [{ text: `Plays ${san}.`, type: "positional" }];
  }
  if (!move) return [{ text: `Plays ${san}.`, type: "positional" }];

  const piece = move.piece;
  const pieceName = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" }[piece];
  const color = turn === "w" ? "White" : "Black";
  const opponent = turn === "w" ? "b" : "w";

  // 1. Capture
  if (move.captured) {
    const capName = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" }[move.captured];
    observations.push({ text: `Captures the ${capName} on ${move.to}.`, type: "material" });
  }

  // 2. Check
  if (after.isCheck()) {
    observations.push({ text: `Gives check to the ${opponent === "w" ? "White" : "Black"} king.`, type: "tactical" });
  }

  // 3. Checkmate
  if (after.isCheckmate()) {
    observations.push({ text: `Checkmate! The game is over.`, type: "tactical" });
  }

  // 4. Center control
  if (CENTER_SQUARES.includes(move.to as Square)) {
    observations.push({ text: `Occupies the center square ${move.to}.`, type: "positional" });
  }

  // 5. Center attack — check if the piece on its new square attacks center squares
  try {
    const attacks = after.moves({ verbose: true }).filter(m => m.from === move!.to);
    const centerAttacks = attacks.filter(m => CENTER_SQUARES.includes(m.to as Square));
    if (centerAttacks.length > 0) {
      const squares = [...new Set(centerAttacks.map(m => m.to))].join(", ");
      observations.push({ text: `Attacks the central square${centerAttacks.length > 1 ? "s" : ""} ${squares}.`, type: "positional" });
    }
  } catch { /* */ }

  // 6. Castling
  if (move.flags.includes("k") || move.flags.includes("q")) {
    const side = move.flags.includes("k") ? "kingside" : "queenside";
    observations.push({ text: `Castles ${side}, bringing the king to safety and connecting the rooks.`, type: "safety" });
  }

  // 7. Development (minor pieces moving from back rank)
  const backRank = turn === "w" ? "1" : "8";
  if ((piece === "n" || piece === "b") && move.from[1] === backRank) {
    observations.push({ text: `Develops the ${pieceName} from its starting square.`, type: "development" });
  }

  // 8. Pawn break
  if (piece === "p" && move.captured === "p") {
    observations.push({ text: `This is a pawn break, changing the pawn structure.`, type: "positional" });
  }

  // 9. Promotion
  if (move.promotion) {
    const promoName = { q: "queen", r: "rook", b: "bishop", n: "knight" }[move.promotion];
    observations.push({ text: `Promotes to a ${promoName}!`, type: "material" });
  }

  // 10. Opens lines for bishop/queen (piece moved away from blocking)
  if (piece === "p") {
    // Check if moving this pawn opened a diagonal for a bishop or file for a rook
    const fileIdx = move.from.charCodeAt(0) - 97;
    // Simplified: check if bishop/queen can now move more
    try {
      const afterMoves = after.moves({ verbose: true });
      const beforeMoves = before.moves({ verbose: true });
      
      const afterBishopQMoves = afterMoves.filter(m => m.piece === "b" || m.piece === "q").length;
      const beforeBishopQMoves = beforeMoves.filter(m => m.piece === "b" || m.piece === "q").length;
      
      if (afterBishopQMoves > beforeBishopQMoves + 2) {
        observations.push({ text: `Opens lines for the bishop and queen.`, type: "development" });
      }
    } catch { /* */ }
  }

  // 11. If nothing interesting, at least describe the move
  if (observations.length === 0) {
    observations.push({ text: `${color} plays ${pieceName} to ${move.to}.`, type: "positional" });
  }

  return observations;
}

/**
 * Build a raw explanation from observations (no LLM needed).
 */
export function buildRawExplanation(observations: Observation[]): string {
  return observations.map(o => o.text).join(" ");
}

/**
 * Generate a polished explanation using LLM via Lovable AI Gateway.
 */
export async function generateCoachExplanation(
  fenBefore: string,
  san: string,
  isPlayerMove: boolean,
  moveNumber: number,
  playerColor: "w" | "b"
): Promise<string> {
  const observations = observeMove(fenBefore, san);
  const rawFacts = observations.map(o => `- ${o.text}`).join("\n");
  
  const mover = fenBefore.split(" ")[1] === "w" ? "White" : "Black";
  const playerSide = playerColor === "w" ? "White" : "Black";

  const prompt = `You are a chess coach explaining moves to a student. Be concise (2-3 sentences max). 
The student is playing ${playerSide}. This is move ${moveNumber}.
${isPlayerMove ? "The student" : "The opponent"} (${mover}) played ${san}.

Here are the concrete facts about this move:
${rawFacts}

Combine these facts into a brief, natural explanation. DO NOT invent any chess facts not listed above. Be encouraging but honest. If it's a capture or check, emphasize it. Keep it casual and coach-like.`;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ prompt, rawFacts }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.explanation || buildRawExplanation(observations);
    }
  } catch {
    /* fallback to raw */
  }

  return buildRawExplanation(observations);
}
