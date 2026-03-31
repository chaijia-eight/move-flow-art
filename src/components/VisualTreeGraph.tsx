import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import type { OpeningNode } from "@/data/openings";

type TreePath = number[];

interface VisualTreeGraphProps {
  tree: OpeningNode[];
  currentPath: TreePath;
  onNavigate: (path: TreePath) => void;
}

interface LayoutNode {
  move: string;
  path: TreePath;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
  isMainLine: boolean;
  childCount: number;
  category: string;
}

const NODE_W = 64;
const NODE_H = 32;
const H_GAP = 16;
const V_GAP = 12;
const STEP_X = NODE_W + H_GAP;
const STEP_Y = NODE_H + V_GAP;

function pathEq(a: TreePath, b: TreePath): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Compute move number label, e.g. "1. e4" or "1... e5" */
function moveLabel(path: TreePath, move: string): string {
  const depth = path.length; // 1-indexed depth
  const moveNum = Math.ceil(depth / 2);
  const isWhite = depth % 2 === 1;
  return isWhite ? `${moveNum}. ${move}` : `${moveNum}... ${move}`;
}

/**
 * Layout algorithm:
 * - Main line (first child) flows horizontally
 * - Branches drop down vertically then continue horizontally
 * Returns all nodes with positions and a running y-cursor
 */
function layoutTree(
  nodes: OpeningNode[],
  basePath: TreePath,
  startX: number,
  startY: number,
  parentPos: { x: number; y: number } | null,
  isMainLine: boolean,
): { layoutNodes: LayoutNode[]; maxY: number } {
  const result: LayoutNode[] = [];
  let maxY = startY;

  if (nodes.length === 0) return { layoutNodes: result, maxY };

  // Process first node (main continuation)
  const mainNode = nodes[0];
  const mainPath = [...basePath, 0];
  const node: LayoutNode = {
    move: mainNode.move,
    path: mainPath,
    x: startX,
    y: startY,
    parentX: parentPos?.x,
    parentY: parentPos?.y,
    isMainLine,
    childCount: mainNode.children.length,
    category: mainNode.category,
  };
  result.push(node);

  // Layout main continuation's children
  let cursorY = startY;
  if (mainNode.children.length > 0) {
    const sub = layoutTree(
      mainNode.children,
      mainPath,
      startX + STEP_X,
      startY,
      { x: startX, y: startY },
      isMainLine,
    );
    result.push(...sub.layoutNodes);
    cursorY = Math.max(cursorY, sub.maxY);
  }

  // Process branches (siblings at index 1+)
  for (let i = 1; i < nodes.length; i++) {
    const branchNode = nodes[i];
    const branchPath = [...basePath, i];
    cursorY += STEP_Y;
    const bNode: LayoutNode = {
      move: branchNode.move,
      path: branchPath,
      x: startX,
      y: cursorY,
      parentX: parentPos?.x,
      parentY: parentPos?.y,
      isMainLine: false,
      childCount: branchNode.children.length,
      category: branchNode.category,
    };
    result.push(bNode);

    if (branchNode.children.length > 0) {
      const sub = layoutTree(
        branchNode.children,
        branchPath,
        startX + STEP_X,
        cursorY,
        { x: startX, y: cursorY },
        false,
      );
      result.push(...sub.layoutNodes);
      cursorY = Math.max(cursorY, sub.maxY);
    }
  }

  maxY = Math.max(maxY, cursorY);
  return { layoutNodes: result, maxY };
}

export default function VisualTreeGraph({ tree, currentPath, onNavigate }: VisualTreeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const { layoutNodes, width, height } = useMemo(() => {
    const { layoutNodes, maxY } = layoutTree(tree, [], 0, 0, null, true);
    const maxX = layoutNodes.reduce((m, n) => Math.max(m, n.x), 0);
    return {
      layoutNodes,
      width: maxX + NODE_W + 80,
      height: maxY + NODE_H + 80,
    };
  }, [tree]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Only start drag on background
    if ((e.target as HTMLElement).closest("[data-tree-node]")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      setOffset({
        x: dragStart.current.ox + (e.clientX - dragStart.current.x),
        y: dragStart.current.oy + (e.clientY - dragStart.current.y),
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  if (tree.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Make a move on the board to see the tree graph.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden rounded-xl border border-border bg-card cursor-grab active:cursor-grabbing relative select-none"
      onMouseDown={handleMouseDown}
    >
      {/* Root diamond */}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width + offset.x + 100,
          height: height + offset.y + 100,
          pointerEvents: "none",
        }}
      >
        {/* Connection lines */}
        {layoutNodes.map((n, i) => {
          if (n.parentX === undefined || n.parentY === undefined) {
            // Connect to root
            const rootX = offset.x - 30;
            const rootY = offset.y + NODE_H / 2;
            return (
              <path
                key={`line-${i}`}
                d={`M ${rootX + 12} ${rootY} C ${rootX + 30} ${rootY}, ${n.x + offset.x - 10} ${n.y + offset.y + NODE_H / 2}, ${n.x + offset.x} ${n.y + offset.y + NODE_H / 2}`}
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.3)"
                strokeWidth={1.5}
              />
            );
          }
          const px = n.parentX + offset.x + NODE_W;
          const py = n.parentY + offset.y + NODE_H / 2;
          const cx = n.x + offset.x;
          const cy = n.y + offset.y + NODE_H / 2;
          return (
            <path
              key={`line-${i}`}
              d={`M ${px} ${py} C ${px + H_GAP / 2} ${py}, ${cx - H_GAP / 2} ${cy}, ${cx} ${cy}`}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.3)"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      {/* Root node (diamond) */}
      <div
        style={{
          position: "absolute",
          left: offset.x - 42,
          top: offset.y + NODE_H / 2 - 10,
        }}
        className="w-5 h-5 rotate-45 bg-amber-500 rounded-sm border-2 border-amber-600 shadow-md"
      />

      {/* Move nodes */}
      {layoutNodes.map((n) => {
        const isActive = pathEq(n.path, currentPath);
        const isOnPath = currentPath.length >= n.path.length && n.path.every((v, i) => v === currentPath[i]);
        const label = moveLabel(n.path, n.move);

        return (
          <div
            key={n.path.join("-")}
            data-tree-node
            onClick={() => onNavigate(n.path)}
            style={{
              position: "absolute",
              left: n.x + offset.x,
              top: n.y + offset.y,
              width: NODE_W,
              height: NODE_H,
            }}
            className={`flex items-center justify-center rounded-md text-[0.65rem] font-mono font-medium cursor-pointer transition-all border whitespace-nowrap px-1 ${
              isActive
                ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30 scale-110 z-10"
                : isOnPath
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : n.category === "mistake"
                    ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                    : n.isMainLine
                      ? "bg-emerald-600/80 text-white border-emerald-700/60 hover:bg-emerald-500"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {label}
            {n.childCount > 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[0.5rem] flex items-center justify-center font-bold">
                {n.childCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
