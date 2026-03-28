import type { OpeningNode, Opening, VariationInfo } from "@/data/openings";
import type { LineOverride } from "@/hooks/useLineOverrides";

export interface CrucialMoment {
  moveIndex: number;       // 0-based index in the line's moves array
  move: string;            // the SAN of the diverging move
  moveNumber: number;      // chess move number (1-based)
  isWhiteMove: boolean;    // true if it's white's move
  isPlayerMove: boolean;   // true if it's the studying player's move
  description: string;     // human-readable summary
}

export interface Line {
  id: string;
  variationId: string;
  openingId: string;
  name: string;
  moves: string[];
  nodeCount: number;
  crucialMoment?: CrucialMoment;
}

/**
 * Extract lines from a variation's tree.
 * A "line" = one complete root-to-leaf path through the tree.
 */
function extractPaths(
  nodes: OpeningNode[],
  currentPath: string[] = []
): string[][] {
  const validNodes = nodes.filter((n) => n.category !== "mistake");
  
  if (validNodes.length === 0) {
    return currentPath.length > 0 ? [currentPath] : [];
  }

  const paths: string[][] = [];
  for (const node of validNodes) {
    const newPath = [...currentPath, node.move];
    const childPaths = extractPaths(node.children, newPath);
    if (childPaths.length === 0) {
      paths.push(newPath);
    } else {
      paths.push(...childPaths);
    }
  }
  return paths;
}

function getVariationSubtree(
  tree: OpeningNode[],
  startingMoves: string[]
): { subtree: OpeningNode[]; prefix: string[] } {
  let nodes = tree;
  const prefix: string[] = [];

  for (const san of startingMoves) {
    const found = nodes.find((n) => n.move === san);
    if (!found) break;
    prefix.push(san);
    nodes = found.children;
  }

  return { subtree: nodes, prefix };
}

/**
 * Find the crucial moment where a line diverges from the main line.
 */
function findCrucialMoment(
  mainMoves: string[],
  lineMoves: string[],
  primarySide: "w" | "b"
): CrucialMoment | undefined {
  for (let i = 0; i < lineMoves.length; i++) {
    if (i >= mainMoves.length || lineMoves[i] !== mainMoves[i]) {
      const isWhiteMove = i % 2 === 0; // move 0 = white's 1st move
      const moveNumber = Math.floor(i / 2) + 1;
      const isPlayerMove = (primarySide === "w") === isWhiteMove;
      const who = isPlayerMove ? "You play" : "Opponent plays";
      const moveLabel = `${moveNumber}${isWhiteMove ? "." : "..."}${lineMoves[i]}`;
      
      return {
        moveIndex: i,
        move: lineMoves[i],
        moveNumber,
        isWhiteMove,
        isPlayerMove,
        description: `${who} ${moveLabel} instead of ${i < mainMoves.length ? mainMoves[i] : "continuing"}`,
      };
    }
  }
  return undefined;
}

export function extractLinesForVariation(
  opening: Opening,
  variation: VariationInfo
): Line[] {
  const startingSans = variation.startingMoves
    .replace(/\d+\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const { subtree, prefix } = getVariationSubtree(variation.tree, startingSans);
  const subPaths = extractPaths(subtree);

  if (subPaths.length === 0) {
    const line: Line = {
      id: `${opening.id}/${variation.id}/line-0`,
      variationId: variation.id,
      openingId: opening.id,
      name: `${variation.name} — Main Line`,
      moves: prefix,
      nodeCount: prefix.length,
    };
    // For trap variations with a single path, synthesize the crucial moment
    if (variation.isTrap && variation.trapMoveIndex != null) {
      line.crucialMoment = buildTrapCrucialMoment(prefix, variation.trapMoveIndex, opening.primarySide);
    }
    return [line];
  }

  const mainMoves = [...prefix, ...subPaths[0]];

  // Build all lines with crucial moments, then filter out player-move branches
  const allCandidates = subPaths.map((subPath, i) => {
    const fullMoves = [...prefix, ...subPath];
    const crucialMoment = i === 0
      ? undefined
      : findCrucialMoment(mainMoves, fullMoves, opening.primarySide);
    return { fullMoves, crucialMoment };
  });

  // Keep main line + lines that diverge on the OPPONENT's move only
  const filtered = allCandidates.filter(
    (c) => !c.crucialMoment || !c.crucialMoment.isPlayerMove
  );

  return filtered.map((c, i) => {
    const line: Line = {
      id: `${opening.id}/${variation.id}/line-${i}`,
      variationId: variation.id,
      openingId: opening.id,
      name: i === 0
        ? `${variation.name} — Main Line`
        : `${variation.name} — Line ${i + 1}`,
      moves: c.fullMoves,
      nodeCount: c.fullMoves.length,
      crucialMoment: c.crucialMoment,
    };
    // For trap main line (i===0), synthesize crucial moment from trapMoveIndex
    if (i === 0 && variation.isTrap && variation.trapMoveIndex != null && !line.crucialMoment) {
      line.crucialMoment = buildTrapCrucialMoment(c.fullMoves, variation.trapMoveIndex, opening.primarySide);
    }
    return line;
  });
}

function buildTrapCrucialMoment(
  moves: string[],
  trapMoveIndex: number,
  primarySide: "w" | "b"
): CrucialMoment | undefined {
  if (trapMoveIndex >= moves.length) return undefined;
  const isWhiteMove = trapMoveIndex % 2 === 0;
  const moveNumber = Math.floor(trapMoveIndex / 2) + 1;
  const isPlayerMove = (primarySide === "w") === isWhiteMove;
  const moveLabel = `${moveNumber}${isWhiteMove ? "." : "..."}${moves[trapMoveIndex]}`;
  const who = isPlayerMove ? "You play" : "Opponent plays";

  return {
    moveIndex: trapMoveIndex,
    move: moves[trapMoveIndex],
    moveNumber,
    isWhiteMove,
    isPlayerMove,
    description: `${who} ${moveLabel} — the mistake!`,
  };
}

export function extractAllLines(opening: Opening): Line[] {
  const allLines: Line[] = [];
  for (const variation of opening.variations) {
    allLines.push(...extractLinesForVariation(opening, variation));
  }
  return allLines;
}

export function countTotalLines(opening: Opening): number {
  return extractAllLines(opening).length;
}

/**
 * Apply database overrides to extracted lines.
 * Overrides can replace moves, set crucial moment index, and override conclusion text.
 */
export function applyLineOverrides(
  lines: Line[],
  overrides: Record<string, LineOverride>,
  primarySide: "w" | "b"
): Line[] {
  return lines.map(line => {
    const override = overrides[line.id];
    if (!override) return line;

    const result = { ...line };

    // Apply moves override
    if (override.moves && override.moves.length > 0) {
      result.moves = override.moves;
      result.nodeCount = override.moves.length;
    }

    // Apply crucial moment override (-1 means explicitly no crucial moment)
    if (override.crucial_moment_index != null) {
      if (override.crucial_moment_index === -1) {
        result.crucialMoment = undefined;
      } else {
        result.crucialMoment = buildTrapCrucialMoment(result.moves, override.crucial_moment_index, primarySide);
      }
    }

    return result;
  });
}
