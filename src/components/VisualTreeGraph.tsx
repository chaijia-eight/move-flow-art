import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { MessageCircle, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { OpeningNode, NagSymbol } from "@/data/openings";
import { NAG_SYMBOLS } from "@/data/openings";

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
  nag?: NagSymbol;
  hasNotes: boolean;
  explanation?: string;
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

function moveLabel(path: TreePath, move: string): string {
  const depth = path.length;
  const moveNum = Math.ceil(depth / 2);
  const isWhite = depth % 2 === 1;
  return isWhite ? `${moveNum}. ${move}` : `${moveNum}... ${move}`;
}

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

  const mainNode = nodes[0];
  const mainChildren = mainNode.children ?? [];
  const mainPath = [...basePath, 0];
  const node: LayoutNode = {
    move: mainNode.move,
    path: mainPath,
    x: startX,
    y: startY,
    parentX: parentPos?.x,
    parentY: parentPos?.y,
    isMainLine,
    childCount: mainChildren.length,
    category: mainNode.category,
    nag: mainNode.nag,
    hasNotes: !!mainNode.explanation,
    explanation: mainNode.explanation,
  };
  result.push(node);

  let cursorY = startY;
  if (mainChildren.length > 0) {
    const sub = layoutTree(
      mainChildren,
      mainPath,
      startX + STEP_X,
      startY,
      { x: startX, y: startY },
      isMainLine,
    );
    result.push(...sub.layoutNodes);
    cursorY = Math.max(cursorY, sub.maxY);
  }

  for (let i = 1; i < nodes.length; i++) {
    const branchNode = nodes[i];
    const branchChildren = branchNode.children ?? [];
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
      childCount: branchChildren.length,
      category: branchNode.category,
      nag: branchNode.nag,
      hasNotes: !!branchNode.explanation,
      explanation: branchNode.explanation,
    };
    result.push(bNode);

    if (branchChildren.length > 0) {
      const sub = layoutTree(
        branchChildren,
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

function getNagIcon(nag?: NagSymbol): string | null {
  if (!nag) return null;
  const sym = NAG_SYMBOLS.find(s => s.key === nag);
  return sym ? sym.icon : null;
}

export default function VisualTreeGraph({ tree, currentPath, onNavigate }: VisualTreeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [notesPopup, setNotesPopup] = useState<{ path: TreePath; text: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.15, 2.5)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.15, 0.3)), []);
  const zoomReset = useCallback(() => { setZoom(1); setOffset({ x: 40, y: 40 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(z => Math.min(Math.max(z - e.deltaY * 0.002, 0.3), 2.5));
    }
  }, []);

  const { layoutNodes, width, height } = useMemo(() => {
    const { layoutNodes, maxY } = layoutTree(tree, [], 0, 0, null, true);
    const maxX = layoutNodes.reduce((m, n) => Math.max(m, n.x), 0);
    return {
      layoutNodes,
      width: maxX + NODE_W + 80,
      height: maxY + NODE_H + 80,
    };
  }, [tree]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-tree-node]")) return;
    setDragging(true);
    setNotesPopup(null);
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

  const toggleNotes = useCallback((n: LayoutNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notesPopup && pathEq(notesPopup.path, n.path)) {
      setNotesPopup(null);
    } else {
      setNotesPopup({
        path: n.path,
        text: n.explanation || "",
        x: n.x + offset.x + NODE_W + 4,
        y: n.y + offset.y,
      });
    }
  }, [notesPopup, offset]);

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
      onWheel={handleWheel}
      onClick={() => setNotesPopup(null)}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
        <button onClick={zoomIn} className="w-7 h-7 rounded-md bg-muted hover:bg-accent flex items-center justify-center border border-border" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5 text-foreground" />
        </button>
        <button onClick={zoomOut} className="w-7 h-7 rounded-md bg-muted hover:bg-accent flex items-center justify-center border border-border" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5 text-foreground" />
        </button>
        <button onClick={zoomReset} className="w-7 h-7 rounded-md bg-muted hover:bg-accent flex items-center justify-center border border-border" title="Reset view">
          <RotateCcw className="w-3.5 h-3.5 text-foreground" />
        </button>
        <span className="text-[0.6rem] text-muted-foreground text-center">{Math.round(zoom * 100)}%</span>
      </div>

      <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
      {/* SVG connections */}
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
        {layoutNodes.map((n, i) => {
          if (n.parentX === undefined || n.parentY === undefined) {
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
        const nagIcon = getNagIcon(n.nag);

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
            {/* NAG icon */}
            {nagIcon && (
              <img src={nagIcon} alt="" className="w-3.5 h-3.5 ml-0.5 inline-block flex-shrink-0" />
            )}
            {/* Branch count badge */}
            {n.childCount > 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[0.5rem] flex items-center justify-center font-bold">
                {n.childCount}
              </span>
            )}
            {/* Notes speech bubble */}
            {n.hasNotes && (
              <button
                onClick={(e) => toggleNotes(n, e)}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center z-20 hover:bg-blue-400 transition-colors"
                title="View notes"
              >
                <MessageCircle className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        );
      })}

      {/* Notes popup */}
      {notesPopup && (
        <div
          data-tree-node
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: notesPopup.x,
            top: notesPopup.y,
            zIndex: 50,
          }}
          className="max-w-[220px] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-3"
        >
          <p className="text-xs leading-relaxed">{notesPopup.text}</p>
        </div>
      )}
      </div>
    </div>
  );
}
