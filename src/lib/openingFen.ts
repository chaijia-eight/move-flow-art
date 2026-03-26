import { Chess } from "chess.js";
import type { OpeningNode, Opening } from "@/data/openings";

/**
 * Get the characteristic FEN of an opening by walking main_line nodes
 * until the first real branching point (where variations diverge).
 * Uses the first variation's startingMoves as a minimum.
 */
export function getOpeningFen(opening: Opening): string {
  const chess = new Chess();

  // Use the first variation's starting moves as the defining sequence
  if (opening.variations.length > 0) {
    const startingMoves = opening.variations[0].startingMoves
      .replace(/\d+\.\s*/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    for (const san of startingMoves) {
      try {
        chess.move(san);
      } catch {
        break;
      }
    }
    return chess.fen();
  }

  // Fallback: walk the tree's main line
  let nodes = opening.tree;
  while (nodes.length > 0) {
    const mainNode = nodes.find((n) => n.category === "main_line") || nodes[0];
    try {
      chess.move(mainNode.move);
    } catch {
      break;
    }
    if (nodes.length > 1) break; // branching point
    nodes = mainNode.children;
  }

  return chess.fen();
}
