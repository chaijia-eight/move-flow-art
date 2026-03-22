import type { OpeningNode, Opening, VariationInfo } from "@/data/openings";

export interface Line {
  id: string; // e.g. "italian-game/giuoco-piano/line-0"
  variationId: string;
  openingId: string;
  name: string; // e.g. "Line 1" or a specific variation name from the tree
  moves: string[]; // SAN sequence for this line
  nodeCount: number;
}

/**
 * Extract lines from a variation's tree.
 * A "line" = one complete root-to-leaf path through the tree.
 * At branching points (where multiple non-mistake children exist), 
 * each branch becomes a separate line.
 */
function extractPaths(
  nodes: OpeningNode[],
  currentPath: string[] = []
): string[][] {
  // Filter out mistake nodes — they're not real lines
  const validNodes = nodes.filter((n) => n.category !== "mistake");
  
  if (validNodes.length === 0) {
    // Leaf reached — return the accumulated path
    return currentPath.length > 0 ? [currentPath] : [];
  }

  const paths: string[][] = [];
  for (const node of validNodes) {
    const newPath = [...currentPath, node.move];
    const childPaths = extractPaths(node.children, newPath);
    if (childPaths.length === 0) {
      // This node is a leaf
      paths.push(newPath);
    } else {
      paths.push(...childPaths);
    }
  }
  return paths;
}

/**
 * Given a variation, walk the tree following the variation's startingMoves
 * to find the subtree, then extract all lines from there.
 * The line includes the starting moves + subtree paths.
 */
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

export function extractLinesForVariation(
  opening: Opening,
  variation: VariationInfo
): Line[] {
  // Parse starting moves
  const startingSans = variation.startingMoves
    .replace(/\d+\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const { subtree, prefix } = getVariationSubtree(variation.tree, startingSans);

  // The prefix itself is always the first line (the base line)
  // Then each path through the subtree becomes an extension
  const subPaths = extractPaths(subtree);

  if (subPaths.length === 0) {
    // Only the base line exists
    return [{
      id: `${opening.id}/${variation.id}/line-0`,
      variationId: variation.id,
      openingId: opening.id,
      name: `${variation.name} — Main Line`,
      moves: prefix,
      nodeCount: prefix.length,
    }];
  }

  return subPaths.map((subPath, i) => ({
    id: `${opening.id}/${variation.id}/line-${i}`,
    variationId: variation.id,
    openingId: opening.id,
    name: i === 0
      ? `${variation.name} — Main Line`
      : `${variation.name} — Line ${i + 1}`,
    moves: [...prefix, ...subPath],
    nodeCount: prefix.length + subPath.length,
  }));
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
