import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ChevronRight, ChevronDown, Trash2, Plus, Cpu, RotateCcw } from "lucide-react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Chessboard from "@/components/Chessboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { getEngine, destroyEngine, type EngineEvaluation } from "@/lib/stockfishEngine";
import type { OpeningNode, MoveCategory } from "@/data/openings";

/** Path of indices into the tree to reach a node */
type TreePath = number[];

function getNodeAtPath(tree: OpeningNode[], path: TreePath): OpeningNode | null {
  if (path.length === 0) return null;
  let node = tree[path[0]];
  if (!node) return null;
  for (let i = 1; i < path.length; i++) {
    node = node.children[path[i]];
    if (!node) return null;
  }
  return node;
}

function getChildrenAtPath(tree: OpeningNode[], path: TreePath): OpeningNode[] {
  if (path.length === 0) return tree;
  const node = getNodeAtPath(tree, path);
  return node ? node.children : [];
}

function cloneTree(tree: OpeningNode[]): OpeningNode[] {
  return JSON.parse(JSON.stringify(tree));
}

function fenAfterMoves(moves: string[], startFen?: string): string {
  const chess = new Chess(startFen);
  for (const m of moves) {
    chess.move(m);
  }
  return chess.fen();
}

function getMovesAlongPath(tree: OpeningNode[], path: TreePath): string[] {
  const moves: string[] = [];
  let nodes = tree;
  for (const idx of path) {
    const node = nodes[idx];
    if (!node) break;
    moves.push(node.move);
    nodes = node.children;
  }
  return moves;
}

export default function RepertoireBuilder() {
  const { repertoireId } = useParams<{ repertoireId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("My Repertoire");
  const [side, setSide] = useState<"w" | "b">("w");
  const [tree, setTree] = useState<OpeningNode[]>([]);
  const [currentPath, setCurrentPath] = useState<TreePath>([]);
  const [selectedNodePath, setSelectedNodePath] = useState<TreePath | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [engineEval, setEngineEval] = useState<EngineEvaluation | null>(null);
  const [engineLoading, setEngineLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!repertoireId);

  // Load existing repertoire
  const { data: existing } = useQuery({
    queryKey: ["repertoire", repertoireId],
    enabled: !!repertoireId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_repertoires")
        .select("*")
        .eq("id", repertoireId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing && !loaded) {
      setName(existing.name);
      setSide(existing.side as "w" | "b");
      setTree((existing.tree || []) as unknown as OpeningNode[]);
      setLoaded(true);
    }
  }, [existing, loaded]);

  // Compute current FEN from path
  const currentMoves = useMemo(() => getMovesAlongPath(tree, currentPath), [tree, currentPath]);
  const currentFen = useMemo(() => fenAfterMoves(currentMoves), [currentMoves]);

  // Current turn
  const chess = useMemo(() => new Chess(currentFen), [currentFen]);
  const currentTurn = chess.turn();

  // Get children at current position (for tree sidebar)
  const currentChildren = useMemo(() => getChildrenAtPath(tree, currentPath), [tree, currentPath]);

  // Handle board move — add a node to the tree
  const handleMove = useCallback((_from: string, _to: string, san: string) => {
    const newTree = cloneTree(tree);

    // Navigate to the current path's children
    let children: OpeningNode[];
    if (currentPath.length === 0) {
      children = newTree;
    } else {
      const parent = getNodeAtPath(newTree, currentPath);
      if (!parent) return;
      children = parent.children;
    }

    // Check if this move already exists as a child
    const existingIdx = children.findIndex((c) => c.move === san);
    if (existingIdx !== -1) {
      // Just navigate to it
      setCurrentPath([...currentPath, existingIdx]);
      setTree(newTree);
      return;
    }

    // Determine category
    const category: MoveCategory = children.length === 0 ? "main_line" : "legit_alternative";

    const newFen = (() => {
      const c = new Chess(currentFen);
      c.move(san);
      return c.fen();
    })();

    const newNode: OpeningNode = {
      fen: newFen,
      move: san,
      category,
      children: [],
    };

    children.push(newNode);
    const newIdx = children.length - 1;
    setTree(newTree);
    setCurrentPath([...currentPath, newIdx]);
    setEngineEval(null);
  }, [tree, currentPath, currentFen]);

  // Navigate to a specific path in the tree
  const navigateTo = useCallback((path: TreePath) => {
    setCurrentPath(path);
    setEngineEval(null);
  }, []);

  // Go back one move
  const goBack = useCallback(() => {
    if (currentPath.length === 0) return;
    setCurrentPath(currentPath.slice(0, -1));
    setEngineEval(null);
  }, [currentPath]);

  // Reset to starting position
  const resetPosition = useCallback(() => {
    setCurrentPath([]);
    setEngineEval(null);
  }, []);

  // Delete a node and its subtree
  const deleteNode = useCallback((path: TreePath) => {
    if (path.length === 0) return;
    const newTree = cloneTree(tree);
    const parentPath = path.slice(0, -1);
    const childIdx = path[path.length - 1];

    let children: OpeningNode[];
    if (parentPath.length === 0) {
      children = newTree;
    } else {
      const parent = getNodeAtPath(newTree, parentPath);
      if (!parent) return;
      children = parent.children;
    }

    children.splice(childIdx, 1);
    setTree(newTree);

    // If we were on or below the deleted node, go to parent
    if (currentPath.length >= path.length) {
      const matchesOrBelow = path.every((v, i) => currentPath[i] === v);
      if (matchesOrBelow) {
        setCurrentPath(parentPath);
      }
    }
    setSelectedNodePath(null);
  }, [tree, currentPath]);

  // Update annotation for selected node
  const updateAnnotation = useCallback((text: string) => {
    if (!selectedNodePath || selectedNodePath.length === 0) return;
    const newTree = cloneTree(tree);
    const node = getNodeAtPath(newTree, selectedNodePath);
    if (!node) return;
    node.explanation = text || undefined;
    setTree(newTree);
    setAnnotation(text);
  }, [tree, selectedNodePath]);

  // When selecting a node, load its annotation
  useEffect(() => {
    if (selectedNodePath) {
      const node = getNodeAtPath(tree, selectedNodePath);
      setAnnotation(node?.explanation || "");
    }
  }, [selectedNodePath, tree]);

  // Run Stockfish evaluation
  const runEval = useCallback(async () => {
    setEngineLoading(true);
    try {
      const engine = getEngine();
      const evaluation = await engine.evaluate(currentFen, 16);
      setEngineEval(evaluation);
    } catch (err) {
      console.error("Engine error:", err);
      toast({ title: "Engine error", description: "Could not evaluate position", variant: "destructive" });
    } finally {
      setEngineLoading(false);
    }
  }, [currentFen]);

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      // Don't destroy singleton; just leave it
    };
  }, []);

  // Save repertoire
  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (repertoireId) {
        await supabase
          .from("user_repertoires")
          .update({
            name,
            side,
            tree: tree as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", repertoireId);
      } else {
        const { data } = await supabase
          .from("user_repertoires")
          .insert({
            user_id: user.id,
            name,
            side,
            tree: tree as any,
          })
          .select("id")
          .single();
        if (data) {
          navigate(`/garden/build/${data.id}`, { replace: true });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["user-repertoires", user.id] });
      toast({ title: t("repertoireSaved") });
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [user, repertoireId, name, side, tree, navigate, queryClient]);

  // Move hints — all legal moves
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    const legalMoves = chess.moves({ verbose: true });
    for (const m of legalMoves) {
      if (!hints.has(m.from)) {
        hints.set(m.from, { category: "main_line", targets: new Map() });
      }
      hints.get(m.from)!.targets.set(m.to, "main_line");
    }
    return hints;
  }, [currentFen]);

  // Format eval score
  const formatScore = (ev: EngineEvaluation) => {
    if (ev.mate !== null) return `M${ev.mate}`;
    const score = ev.score / 100;
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/garden")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-serif font-bold bg-transparent border-none focus-visible:ring-0 px-0 h-auto"
              placeholder={t("repertoireName")}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Side toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setSide("w")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  side === "w" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                White
              </button>
              <button
                onClick={() => setSide("b")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  side === "b" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Black
              </button>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {t("saveRepertoire")}
            </Button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          {/* Board */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square max-w-[560px] w-full mx-auto">
              <Chessboard
                fen={currentFen}
                onMove={handleMove}
                moveHints={moveHints}
                flipped={side === "b"}
                playerColor={undefined}
                arrowFrom={engineEval?.bestMove ? engineEval.bestMove.slice(0, 2) : undefined}
                arrowTo={engineEval?.bestMove ? engineEval.bestMove.slice(2, 4) : undefined}
              />
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-2 max-w-[560px] w-full mx-auto">
              <Button variant="outline" size="sm" onClick={resetPosition} disabled={currentPath.length === 0}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goBack} disabled={currentPath.length === 0}>
                ← Back
              </Button>
              <span className="text-xs text-muted-foreground font-mono px-3">
                Move {currentMoves.length}
              </span>

              {/* Engine eval button */}
              <Button
                variant="outline"
                size="sm"
                onClick={runEval}
                disabled={engineLoading}
                className="gap-1.5 ml-auto"
              >
                <Cpu className="w-4 h-4" />
                {engineLoading ? "..." : t("engineEval")}
              </Button>
            </div>

            {/* Engine result */}
            <AnimatePresence>
              {engineEval && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-[560px] w-full mx-auto rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-mono font-bold ${
                      engineEval.score > 50 ? "text-green-500" : engineEval.score < -50 ? "text-red-500" : "text-muted-foreground"
                    }`}>
                      {formatScore(engineEval)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("depth")}: {engineEval.depth}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono ml-auto">
                      Best: {engineEval.pv.slice(0, 5).join(" ")}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Move tree + annotation */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Move tree */}
            <div className="rounded-xl border border-border bg-card flex-1 min-h-0 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{t("moveTree")}</h3>
                <span className="text-xs text-muted-foreground">
                  {tree.length > 0 ? `${countTreeNodes(tree)} moves` : "Empty"}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {tree.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Make a move on the board to start building.
                  </p>
                ) : (
                  <TreeView
                    nodes={tree}
                    path={[]}
                    currentPath={currentPath}
                    selectedPath={selectedNodePath}
                    onNavigate={navigateTo}
                    onSelect={setSelectedNodePath}
                    onDelete={deleteNode}
                    depth={0}
                  />
                )}
              </div>
            </div>

            {/* Annotation panel */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">{t("annotation")}</h3>
              {selectedNodePath ? (
                <Textarea
                  value={annotation}
                  onChange={(e) => updateAnnotation(e.target.value)}
                  placeholder="Add notes for this move..."
                  className="text-sm min-h-[80px] resize-none"
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click a move in the tree to annotate it.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: count all nodes in tree
function countTreeNodes(nodes: OpeningNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1 + countTreeNodes(node.children);
  }
  return count;
}

// Recursive tree view component
function TreeView({
  nodes,
  path,
  currentPath,
  selectedPath,
  onNavigate,
  onSelect,
  onDelete,
  depth,
}: {
  nodes: OpeningNode[];
  path: TreePath;
  currentPath: TreePath;
  selectedPath: TreePath | null;
  onNavigate: (p: TreePath) => void;
  onSelect: (p: TreePath | null) => void;
  onDelete: (p: TreePath) => void;
  depth: number;
}) {
  return (
    <div className={depth > 0 ? "ml-3 border-l border-border/50 pl-2" : ""}>
      {nodes.map((node, i) => {
        const nodePath = [...path, i];
        const isCurrent = currentPath.length === nodePath.length &&
          nodePath.every((v, idx) => currentPath[idx] === v);
        const isSelected = selectedPath &&
          selectedPath.length === nodePath.length &&
          nodePath.every((v, idx) => selectedPath[idx] === v);
        const isOnPath = currentPath.length > nodePath.length &&
          nodePath.every((v, idx) => currentPath[idx] === v);

        // Compute move number display
        const moveNum = nodePath.length;
        const isWhiteMove = moveNum % 2 === 1;
        const displayNum = Math.ceil(moveNum / 2);
        const movePrefix = isWhiteMove ? `${displayNum}.` : `${displayNum}...`;

        return (
          <div key={i}>
            <div className="flex items-center group">
              <button
                onClick={() => {
                  onNavigate(nodePath);
                  onSelect(nodePath);
                }}
                className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isOnPath
                    ? "bg-primary/20 text-foreground"
                    : isSelected
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-muted-foreground mr-0.5">{movePrefix}</span>
                {node.move}
              </button>
              {node.explanation && (
                <span className="text-[0.6rem] text-muted-foreground ml-1">💬</span>
              )}
              {node.category === "legit_alternative" && (
                <span className="text-[0.6rem] text-amber-500/80 ml-1">alt</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(nodePath);
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {node.children.length > 0 && (
              <TreeView
                nodes={node.children}
                path={nodePath}
                currentPath={currentPath}
                selectedPath={selectedPath}
                onNavigate={onNavigate}
                onSelect={onSelect}
                onDelete={onDelete}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
