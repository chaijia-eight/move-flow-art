/**
 * Move Coach — generates natural language explanations for chess moves.
 * 
 * Inspired by WintrChess's observation-based assessment system.
 * Stage 1: Rich chess observations (hand-written chess logic)
 * Stage 2: LLM stitching via Lovable AI Gateway
 */

import { Chess, type Square, type Move } from "chess.js";

const CENTER_SQUARES: Square[] = ["d4", "d5", "e4", "e5"];
const EXTENDED_CENTER: Square[] = ["c3", "c4", "c5", "c6", "d3", "d6", "e3", "e6", "f3", "f4", "f5", "f6"];

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const PIECE_NAME: Record<string, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

const BACK_RANK_W = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
const BACK_RANK_B = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];

// Knight natural development squares
const KNIGHT_NATURAL: Record<string, string> = {
  g1: "f3", b1: "c3", g8: "f6", b8: "c6"
};

// Fianchetto preps
const FIANCHETTO_PAWNS = ["g3", "b3", "g6", "b6"];

interface Observation {
  text: string;
  type: "positional" | "tactical" | "development" | "safety" | "material" | "strategic";
  priority: number; // higher = more important
}

/**
 * Determine approximate game stage based on piece count.
 */
function getGameStage(chess: Chess): "opening" | "middlegame" | "endgame" {
  const board = chess.board();
  let minorMajor = 0;
  for (const row of board) {
    for (const sq of row) {
      if (sq && sq.type !== "p" && sq.type !== "k") minorMajor++;
    }
  }
  if (minorMajor >= 8) return "opening";
  if (minorMajor >= 4) return "middlegame";
  return "endgame";
}

/**
 * Count how many pieces of a color are developed (off back rank).
 */
function countDeveloped(chess: Chess, color: "w" | "b"): number {
  const backRank = color === "w" ? "1" : "8";
  const board = chess.board();
  let count = 0;
  for (const row of board) {
    for (const sq of row) {
      if (sq && sq.color === color && (sq.type === "n" || sq.type === "b")) {
        // This piece exists; check if it's off back rank
        // We need to find its square...
      }
    }
  }
  // Alternative: use moves to check
  const pieces = ["n", "b"];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq && sq.color === color && pieces.includes(sq.type)) {
        const rank = String(8 - r);
        if (rank !== backRank) count++;
      }
    }
  }
  return count;
}

/**
 * Check if a square is attacked by a given color.
 */
function isAttackedBy(chess: Chess, square: Square, color: "w" | "b"): boolean {
  return chess.isAttacked(square, color);
}

/**
 * Get pieces attacking a given square.
 */
function getAttackers(chess: Chess, square: Square, attackerColor: "w" | "b"): { type: string; square: Square }[] {
  const attackers: { type: string; square: Square }[] = [];
  const board = chess.board();
  // Check each piece of attackerColor and see if it can reach the target
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== attackerColor) continue;
      const from = (String.fromCharCode(97 + c) + String(8 - r)) as Square;
      // Try making a capture to this square in a temp game
      try {
        const temp = new Chess(chess.fen());
        // Set turn to attacker's color if needed
        const fen = temp.fen().split(" ");
        fen[1] = attackerColor;
        fen[3] = "-"; // clear en passant to avoid issues
        const tempGame = new Chess(fen.join(" "));
        const moves = tempGame.moves({ square: from, verbose: true });
        if (moves.some(m => m.to === square)) {
          attackers.push({ type: piece.type, square: from });
        }
      } catch { /* skip */ }
    }
  }
  return attackers;
}

/**
 * Check if a piece on a square is hanging (attacked and not defended, or
 * attacked by lower-value piece).
 */
function isHanging(chess: Chess, square: Square): boolean {
  const board = chess.board();
  const coords = squareToCoords(square);
  const piece = board[coords[0]][coords[1]];
  if (!piece) return false;
  
  const opponent = piece.color === "w" ? "b" : "w";
  const attacked = isAttackedBy(chess, square, opponent);
  if (!attacked) return false;
  
  const defended = isAttackedBy(chess, square, piece.color);
  if (!defended) return true;
  
  // Attacked by lower-value piece
  const attackers = getAttackers(chess, square, opponent);
  const lowestAttacker = Math.min(...attackers.map(a => PIECE_VALUES[a.type] || 99));
  return lowestAttacker < PIECE_VALUES[piece.type];
}

function squareToCoords(sq: string): [number, number] {
  return [8 - parseInt(sq[1]), sq.charCodeAt(0) - 97];
}

/**
 * Generate rich, factual observations about a move.
 * Inspired by WintrChess's observation system.
 */
export function observeMove(fenBefore: string, san: string): Observation[] {
  const observations: Observation[] = [];
  const before = new Chess(fenBefore);
  const turn = before.turn();
  const color = turn === "w" ? "White" : "Black";
  const opponent = turn === "w" ? "b" : "w";
  const opponentName = opponent === "w" ? "White" : "Black";

  // Play the move
  const after = new Chess(fenBefore);
  let move: Move | null;
  try {
    move = after.move(san);
  } catch {
    return [{ text: `Plays ${san}.`, type: "positional", priority: 1 }];
  }
  if (!move) return [{ text: `Plays ${san}.`, type: "positional", priority: 1 }];

  const piece = move.piece;
  const pieceName = PIECE_NAME[piece];
  const stage = getGameStage(before);

  // === MATERIAL ===
  
  // 1. Capture
  if (move.captured) {
    const capName = PIECE_NAME[move.captured];
    const capValue = PIECE_VALUES[move.captured];
    const pieceValue = PIECE_VALUES[piece];
    
    if (capValue > pieceValue) {
      observations.push({ text: `Wins material by capturing the ${capName} on ${move.to} with the ${pieceName} (gaining ${capValue - pieceValue} points of material).`, type: "material", priority: 9 });
    } else if (capValue === pieceValue) {
      observations.push({ text: `Trades ${pieceName} for ${capName} on ${move.to}.`, type: "material", priority: 5 });
    } else {
      observations.push({ text: `Captures the ${capName} on ${move.to}, but gives up the more valuable ${pieceName}.`, type: "material", priority: 7 });
    }
  }

  // 2. Promotion
  if (move.promotion) {
    const promoName = PIECE_NAME[move.promotion];
    observations.push({ text: `Promotes to a ${promoName}!`, type: "material", priority: 10 });
  }

  // === TACTICAL ===
  
  // 3. Check & Checkmate
  if (after.isCheckmate()) {
    observations.push({ text: `Checkmate! The game is over.`, type: "tactical", priority: 10 });
  } else if (after.isCheck()) {
    observations.push({ text: `Gives check to the ${opponentName} king.`, type: "tactical", priority: 7 });
  }

  // 4. Discovered attack detection (piece moved away, revealing attack)
  if (piece !== "q" && piece !== "k") {
    try {
      // Check if moving this piece revealed an attack from a bishop/rook/queen
      const afterMoves = after.moves({ verbose: true });
      const beforeMoves = before.moves({ verbose: true });
      
      // Find pieces that can now attack opponent pieces that couldn't before
      const newAttackPieces = afterMoves.filter(m => 
        m.captured && m.from !== move!.to && 
        (m.piece === "b" || m.piece === "r" || m.piece === "q") &&
        !beforeMoves.some(bm => bm.from === m.from && bm.to === m.to)
      );
      
      if (newAttackPieces.length > 0) {
        const attackerType = PIECE_NAME[newAttackPieces[0].piece];
        const targetType = PIECE_NAME[newAttackPieces[0].captured!];
        observations.push({ 
          text: `Discovers an attack from the ${attackerType} onto the ${targetType}.`, 
          type: "tactical", priority: 8 
        });
      }
    } catch { /* */ }
  }

  // 5. Fork detection — piece attacks 2+ higher-value or undefended pieces
  try {
    const pieceMoves = after.moves({ verbose: true }).filter(m => m.from === move!.to && m.captured);
    const attackedPieces = pieceMoves.map(m => ({
      type: m.captured!,
      square: m.to,
      value: PIECE_VALUES[m.captured!]
    }));
    
    const valuableTargets = attackedPieces.filter(t => t.value >= PIECE_VALUES[piece] || t.type === "k");
    if (valuableTargets.length >= 2) {
      const targets = valuableTargets.map(t => PIECE_NAME[t.type]).join(" and ");
      observations.push({ 
        text: `Forks the ${targets} with the ${pieceName}!`, 
        type: "tactical", priority: 9 
      });
    }
  } catch { /* */ }

  // 6. Hanging piece detection — did this move leave a piece undefended?
  try {
    if (isHanging(after, move.to as Square)) {
      observations.push({ 
        text: `The ${pieceName} on ${move.to} is left undefended and could be captured.`, 
        type: "tactical", priority: 6 
      });
    }
  } catch { /* */ }

  // === POSITIONAL ===
  
  // 7. Center control
  if (CENTER_SQUARES.includes(move.to as Square)) {
    if (piece === "p") {
      observations.push({ text: `Claims the center with a pawn on ${move.to}.`, type: "positional", priority: 5 });
    } else {
      observations.push({ text: `Occupies the central square ${move.to}.`, type: "positional", priority: 4 });
    }
  }

  // 8. Center pressure — attacks center squares
  try {
    const pieceMoves = after.moves({ verbose: true }).filter(m => m.from === move!.to);
    const centerAttacks = pieceMoves.filter(m => CENTER_SQUARES.includes(m.to as Square));
    if (centerAttacks.length > 0 && !CENTER_SQUARES.includes(move.to as Square)) {
      const squares = [...new Set(centerAttacks.map(m => m.to))].join(" and ");
      observations.push({ 
        text: `Puts pressure on the central square${centerAttacks.length > 1 ? "s" : ""} ${squares}.`, 
        type: "positional", priority: 3 
      });
    }
  } catch { /* */ }

  // 9. Pawn structure changes
  if (piece === "p") {
    // Pawn break
    if (move.captured === "p") {
      observations.push({ text: `This pawn break changes the pawn structure.`, type: "positional", priority: 4 });
    }
    
    // Check for doubled pawns
    try {
      const file = move.to[0];
      const board = after.board();
      let pawnsOnFile = 0;
      for (let r = 0; r < 8; r++) {
        const col = file.charCodeAt(0) - 97;
        const sq = board[r][col];
        if (sq && sq.type === "p" && sq.color === turn) pawnsOnFile++;
      }
      if (pawnsOnFile >= 2) {
        observations.push({ text: `Creates doubled pawns on the ${file}-file, which can be a structural weakness.`, type: "strategic", priority: 4 });
      }
    } catch { /* */ }
  }

  // 10. Open/semi-open files after pawn move or capture
  if (piece === "p" || move.captured === "p") {
    try {
      const file = move.captured ? move.to[0] : move.from[0];
      const board = after.board();
      const col = file.charCodeAt(0) - 97;
      let hasPawn = false;
      for (let r = 0; r < 8; r++) {
        const sq = board[r][col];
        if (sq && sq.type === "p") { hasPawn = true; break; }
      }
      if (!hasPawn) {
        observations.push({ text: `Opens the ${file}-file, which can benefit rooks and queens.`, type: "strategic", priority: 5 });
      }
    } catch { /* */ }
  }

  // === DEVELOPMENT ===
  
  // 11. Piece development from back rank
  const backRank = turn === "w" ? "1" : "8";
  if ((piece === "n" || piece === "b") && move.from[1] === backRank) {
    if (piece === "n") {
      // Natural knight development?
      const natural = KNIGHT_NATURAL[move.from];
      if (natural && move.to === natural) {
        observations.push({ text: `Develops the knight to its most natural square ${move.to}.`, type: "development", priority: 5 });
      } else if (move.to[0] === "a" || move.to[0] === "h") {
        observations.push({ text: `Develops the knight to the rim (${move.to}). Knights are generally less effective on the edge of the board.`, type: "development", priority: 5 });
      } else {
        observations.push({ text: `Develops the knight from its starting square.`, type: "development", priority: 4 });
      }
    } else {
      observations.push({ text: `Develops the bishop from its starting square.`, type: "development", priority: 4 });
    }
  }

  // 12. Fianchetto preparation
  if (piece === "p" && FIANCHETTO_PAWNS.includes(move.to) && stage === "opening") {
    observations.push({ text: `Prepares a fianchetto for the bishop.`, type: "development", priority: 3 });
  }

  // 13. Early queen moves in the opening
  if (piece === "q" && stage === "opening") {
    const developed = countDeveloped(before, turn);
    if (developed < 3) {
      observations.push({ text: `Moves the queen early in the opening, before finishing minor piece development.`, type: "development", priority: 5 });
    }
  }

  // 14. Blocking knight development with pawn
  if (piece === "p" && stage === "opening") {
    const knightSquares = turn === "w" 
      ? { c3: "b1", f3: "g1" } 
      : { c6: "b8", f6: "g8" };
    const blockedKnight = knightSquares[move.to as keyof typeof knightSquares];
    if (blockedKnight) {
      try {
        const coords = squareToCoords(blockedKnight);
        const sq = before.board()[coords[0]][coords[1]];
        if (sq && sq.type === "n" && sq.color === turn) {
          observations.push({ text: `This pawn move blocks the natural development of the knight.`, type: "development", priority: 4 });
        }
      } catch { /* */ }
    }
  }

  // === SAFETY ===
  
  // 15. Castling
  if (move.flags.includes("k") || move.flags.includes("q")) {
    const side = move.flags.includes("k") ? "kingside" : "queenside";
    observations.push({ text: `Castles ${side}, bringing the king to safety and connecting the rooks.`, type: "safety", priority: 6 });
  }

  // 16. King safety — moving king in non-castling moves (risky)
  if (piece === "k" && !move.flags.includes("k") && !move.flags.includes("q") && stage !== "endgame") {
    observations.push({ text: `Moves the king, which loses the right to castle.`, type: "safety", priority: 5 });
  }

  // 17. Opening up lines for bishop/queen
  if (piece === "p") {
    try {
      const afterMoves = after.moves({ verbose: true });
      const beforeMoves = before.moves({ verbose: true });
      const afterBQ = afterMoves.filter(m => (m.piece === "b" || m.piece === "q") && m.color === turn).length;
      const beforeBQ = beforeMoves.filter(m => (m.piece === "b" || m.piece === "q") && m.color === turn).length;
      if (afterBQ > beforeBQ + 2) {
        observations.push({ text: `Opens diagonal lines for the bishop and queen.`, type: "development", priority: 4 });
      }
    } catch { /* */ }
  }

  // 18. Piece activity — knight on outpost
  if (piece === "n" && EXTENDED_CENTER.includes(move.to as Square)) {
    // Check if no opposing pawns can attack this square
    const file = move.to.charCodeAt(0) - 97;
    const rank = parseInt(move.to[1]);
    const board = after.board();
    let canBeKicked = false;
    const pawnDir = turn === "w" ? 1 : -1;
    // Check adjacent files for enemy pawns that could kick the knight
    for (const adjFile of [file - 1, file + 1]) {
      if (adjFile < 0 || adjFile > 7) continue;
      for (let r = 0; r < 8; r++) {
        const sq = board[r][adjFile];
        if (sq && sq.type === "p" && sq.color === opponent) {
          const sqRank = 8 - r;
          if ((turn === "w" && sqRank > rank) || (turn === "b" && sqRank < rank)) {
            canBeKicked = true;
          }
        }
      }
    }
    if (!canBeKicked) {
      observations.push({ text: `Places the knight on a strong outpost on ${move.to}, where it cannot be challenged by pawns.`, type: "positional", priority: 6 });
    }
  }

  // === GAME-STAGE OBSERVATIONS ===
  
  // 19. Endgame king activity
  if (piece === "k" && stage === "endgame" && !after.isCheck()) {
    if (CENTER_SQUARES.includes(move.to as Square) || EXTENDED_CENTER.includes(move.to as Square)) {
      observations.push({ text: `Centralizes the king, which becomes an active piece in the endgame.`, type: "strategic", priority: 5 });
    }
  }

  // 20. Rook activity
  if (piece === "r") {
    // Check if rook is now on an open or semi-open file
    const file = move.to[0];
    const col = file.charCodeAt(0) - 97;
    const board = after.board();
    let ownPawns = 0, oppPawns = 0;
    for (let r = 0; r < 8; r++) {
      const sq = board[r][col];
      if (sq && sq.type === "p") {
        if (sq.color === turn) ownPawns++;
        else oppPawns++;
      }
    }
    if (ownPawns === 0 && oppPawns === 0) {
      observations.push({ text: `Places the rook on the open ${file}-file.`, type: "positional", priority: 5 });
    } else if (ownPawns === 0) {
      observations.push({ text: `Places the rook on the semi-open ${file}-file.`, type: "positional", priority: 4 });
    }
    
    // Rook on 7th rank
    const seventhRank = turn === "w" ? "7" : "2";
    if (move.to[1] === seventhRank) {
      observations.push({ text: `Infiltrates the rook to the ${seventhRank}th rank, attacking pawns and restricting the king.`, type: "tactical", priority: 6 });
    }
  }

  // Fallback
  if (observations.length === 0) {
    observations.push({ text: `Plays ${pieceName} to ${move.to}.`, type: "positional", priority: 1 });
  }

  // Sort by priority
  observations.sort((a, b) => b.priority - a.priority);

  return observations;
}

/**
 * Build a raw explanation from observations (no LLM needed).
 */
export function buildRawExplanation(observations: Observation[]): string {
  return observations.slice(0, 4).map(o => o.text).join(" ");
}

/**
 * Generate a polished explanation using LLM via Lovable AI Gateway.
 * Uses WintrChess-inspired structured prompting.
 */
export async function generateCoachExplanation(
  fenBefore: string,
  san: string,
  isPlayerMove: boolean,
  moveNumber: number,
  playerColor: "w" | "b"
): Promise<string> {
  const observations = observeMove(fenBefore, san);
  const statements = observations.slice(0, 6).map(o => `- ${o.text}`).join("\n");
  
  const mover = fenBefore.split(" ")[1] === "w" ? "White" : "Black";
  const playerSide = playerColor === "w" ? "White" : "Black";
  const person = isPlayerMove ? "second" : "first";

  // WintrChess-style structured prompt
  const userPrompt = `Move ${moveNumber}: ${san} was played in this position (FEN: ${fenBefore}).

Observations about this move:
${statements}

Compile these observations into a brief, natural coaching comment (2-3 sentences max). ${
    isPlayerMove 
      ? 'Address the student as "you" (second person). Comment on the quality of their move based on the observations.'
      : 'Speak as "I" (first person), explaining what you are doing and why.'
  }`;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ prompt: userPrompt, rawFacts: buildRawExplanation(observations) }),
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
