import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Trash2, Cpu, RotateCcw, Plus, FileText, Play, X } from "lucide-react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Chessboard from "@/components/Chessboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { getEngine, type EngineEvaluation } from "@/lib/stockfishEngine";
import type { OpeningNode, MoveCategory, NagSymbol, CustomArrow, CustomHighlight } from "@/data/openings";
import { NAG_SYMBOLS } from "@/data/openings";

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

// Single highlight color — toggle on/off
const HIGHLIGHT_COLOR = "hsl(140, 65%, 45%)";

interface Chapter {
  name: string;
  tree: OpeningNode[];
}

export default function RepertoireBuilder() {
  const { repertoireId } = useParams<{ repertoireId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("My Repertoire");
  const [side, setSide] = useState<"w" | "b">("w");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [currentPath, setCurrentPath] = useState<TreePath>([]);
  const [selectedNodePath, setSelectedNodePath] = useState<TreePath | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [engineEval, setEngineEval] = useState<EngineEvaluation | null>(null);
  const [engineLoading, setEngineLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!repertoireId);
  const [showChapterCreate, setShowChapterCreate] = useState(false);
  const [pgnInput, setPgnInput] = useState("");
  const [showPgnImport, setShowPgnImport] = useState(false);
  const [newChapterName, setNewChapterName] = useState("Chapter 1");

  // Derived tree from active chapter
  const tree = chapters[activeChapterIdx]?.tree ?? [];
  const setTree = useCallback((newTree: OpeningNode[] | ((prev: OpeningNode[]) => OpeningNode[])) => {
    setChapters(prev => {
      const updated = [...prev];
      if (updated[activeChapterIdx]) {
        const resolved = typeof newTree === 'function' ? newTree(updated[activeChapterIdx].tree) : newTree;
        updated[activeChapterIdx] = { ...updated[activeChapterIdx], tree: resolved };
      }
      return updated;
    });
  }, [activeChapterIdx]);

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
      // Support old format (plain tree) and new format (chapters array)
      const raw = existing.tree as any;
      if (Array.isArray(raw) && raw.length > 0 && raw[0]?.name !== undefined && raw[0]?.tree !== undefined) {
        setChapters(raw as Chapter[]);
      } else if (Array.isArray(raw) && raw.length > 0) {
        setChapters([{ name: "Chapter 1", tree: raw as unknown as OpeningNode[] }]);
      } else {
        setChapters([]);
      }
      setLoaded(true);
    }
  }, [existing, loaded]);

  // Compute current FEN from path
  const currentMoves = useMemo(() => getMovesAlongPath(tree, currentPath), [tree, currentPath]);
  const currentFen = useMemo(() => fenAfterMoves(currentMoves), [currentMoves]);

  const chess = useMemo(() => new Chess(currentFen), [currentFen]);

  // Get current node's arrows and highlights
  const currentNode = useMemo(() => {
    if (currentPath.length === 0) return null;
    return getNodeAtPath(tree, currentPath);
  }, [tree, currentPath]);

  const nodeArrows = currentNode?.arrows || [];
  const nodeHighlights = currentNode?.highlights || [];

  // Build NAG overlays map: for the current node, show its NAG on the piece that moved
  const nagOverlays = useMemo(() => {
    const map = new Map<string, NagSymbol>();
    if (currentNode?.nag && currentNode.fen) {
      // The piece that just moved is on the target square; parse the move's target from FEN
      // We can derive the target square from the last move in currentMoves
      const lastMove = currentMoves[currentMoves.length - 1];
      if (lastMove) {
        // Get the destination square by trying the move
        try {
          const prevFen = currentPath.length > 1
            ? fenAfterMoves(currentMoves.slice(0, -1))
            : new Chess().fen();
          const c = new Chess(prevFen);
          const m = c.move(lastMove);
          if (m) {
            map.set(m.to, currentNode.nag);
          }
        } catch {}
      }
    }
    return map;
  }, [currentNode, currentMoves, currentPath]);

  // Handle board move
  const handleMove = useCallback((_from: string, _to: string, san: string) => {
    // Auto-create a chapter if none exist
    if (chapters.length === 0) {
      const newFen = (() => { const c = new Chess(); c.move(san); return c.fen(); })();
      const newNode: OpeningNode = { fen: newFen, move: san, category: "main_line", children: [] };
      setChapters([{ name: "Chapter 1", tree: [newNode] }]);
      setActiveChapterIdx(0);
      setCurrentPath([0]);
      setShowChapterCreate(false);
      return;
    }
    const newTree = cloneTree(tree);

    let children: OpeningNode[];
    if (currentPath.length === 0) {
      children = newTree;
    } else {
      const parent = getNodeAtPath(newTree, currentPath);
      if (!parent) return;
      children = parent.children;
    }

    const existingIdx = children.findIndex((c) => c.move === san);
    if (existingIdx !== -1) {
      setCurrentPath([...currentPath, existingIdx]);
      setTree(newTree);
      return;
    }

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
  }, [tree, currentPath, currentFen, chapters]);

  const navigateTo = useCallback((path: TreePath) => {
    setCurrentPath(path);
    setEngineEval(null);
  }, []);

  const goBack = useCallback(() => {
    if (currentPath.length === 0) return;
    setCurrentPath(currentPath.slice(0, -1));
    setEngineEval(null);
  }, [currentPath]);

  const goForward = useCallback(() => {
    const children = currentPath.length === 0 ? tree : (getNodeAtPath(tree, currentPath)?.children ?? []);
    if (children.length > 0) {
      setCurrentPath([...currentPath, 0]);
      setEngineEval(null);
    }
  }, [currentPath, tree]);

  const resetPosition = useCallback(() => {
    setCurrentPath([]);
    setEngineEval(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goBack(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goBack, goForward]);

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

    if (currentPath.length >= path.length) {
      const matchesOrBelow = path.every((v, i) => currentPath[i] === v);
      if (matchesOrBelow) {
        setCurrentPath(parentPath);
      }
    }
    setSelectedNodePath(null);
  }, [tree, currentPath]);

  const updateAnnotation = useCallback((text: string) => {
    if (currentPath.length === 0) return;
    const newTree = cloneTree(tree);
    const node = getNodeAtPath(newTree, currentPath);
    if (!node) return;
    node.explanation = text || undefined;
    setTree(newTree);
    setAnnotation(text);
  }, [tree, currentPath]);

  // NAG update
  const updateNag = useCallback((nag: NagSymbol | undefined) => {
    if (currentPath.length === 0) return;
    const newTree = cloneTree(tree);
    const node = getNodeAtPath(newTree, currentPath);
    if (!node) return;
    node.nag = nag;
    setTree(newTree);
  }, [tree, currentPath]);

  useEffect(() => {
    const node = currentPath.length > 0 ? getNodeAtPath(tree, currentPath) : null;
    setAnnotation(node?.explanation || "");
  }, [currentPath, tree]);

  // Arrow drawing from board
  const handleArrowDraw = useCallback((_type: "arrow", data: { from: string; to: string; color: string }) => {
    if (currentPath.length === 0) return;
    const newTree = cloneTree(tree);
    const node = getNodeAtPath(newTree, currentPath);
    if (!node) return;
    if (!node.arrows) node.arrows = [];
    // Toggle: remove if same from/to exists
    const existingIdx = node.arrows.findIndex(a => a.from === data.from && a.to === data.to);
    if (existingIdx !== -1) {
      node.arrows.splice(existingIdx, 1);
    } else {
      node.arrows.push({ from: data.from, to: data.to, color: data.color });
    }
    setTree(newTree);
  }, [tree, currentPath]);

  // Square highlight from board — simple toggle
  const handleSquareHighlight = useCallback((square: string) => {
    if (currentPath.length === 0) return;
    const newTree = cloneTree(tree);
    const node = getNodeAtPath(newTree, currentPath);
    if (!node) return;
    if (!node.highlights) node.highlights = [];
    const existingIdx = node.highlights.findIndex(h => h.square === square);
    if (existingIdx !== -1) {
      node.highlights.splice(existingIdx, 1);
    } else {
      node.highlights.push({ square, color: HIGHLIGHT_COLOR });
    }
    setTree(newTree);
  }, [tree, currentPath]);

  // Stockfish
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

  useEffect(() => {
    return () => {};
  }, []);

  // Save
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
            tree: chapters as any,
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
            tree: chapters as any,
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
  }, [user, repertoireId, name, side, chapters, navigate, queryClient]);

  // Create a new chapter
  const createChapter = useCallback((chapterTree: OpeningNode[]) => {
    const chapterName = newChapterName.trim() || `Chapter ${chapters.length + 1}`;
    setChapters(prev => [...prev, { name: chapterName, tree: chapterTree }]);
    setActiveChapterIdx(chapters.length);
    setCurrentPath([]);
    setSelectedNodePath(null);
    setShowChapterCreate(false);
    setShowPgnImport(false);
    setPgnInput("");
    setNewChapterName(`Chapter ${chapters.length + 2}`);
  }, [chapters.length, newChapterName]);

  // PGN import: parse PGN into tree
  const importPgn = useCallback((pgn: string) => {
    try {
      const c = new Chess();
      c.loadPgn(pgn);
      const history = c.history();
      if (history.length === 0) {
        toast({ title: "No moves found in PGN", variant: "destructive" });
        return;
      }
      const buildTree = (moves: string[], idx: number): OpeningNode[] => {
        if (idx >= moves.length) return [];
        const c2 = new Chess();
        for (let i = 0; i <= idx; i++) c2.move(moves[i]);
        return [{
          fen: c2.fen(),
          move: moves[idx],
          category: "main_line" as MoveCategory,
          children: buildTree(moves, idx + 1),
        }];
      };
      const newTree = buildTree(history, 0);
      createChapter(newTree);
      toast({ title: `Imported ${history.length} moves` });
    } catch (err) {
      toast({ title: "Invalid PGN", variant: "destructive" });
    }
  }, [createChapter]);

  // Start from starting position — creates a new empty chapter
  const startFromPosition = useCallback(() => {
    createChapter([]);
  }, [createChapter]);

  // Auto-show chapter creation when no chapters exist
  const hasChapters = chapters.length > 0;

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

  const formatScore = (ev: EngineEvaluation) => {
    if (ev.mate !== null) return `M${ev.mate}`;
    const score = ev.score / 100;
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
  };

  // Get selected node for annotation panel
  const selectedNode = useMemo(() => {
    if (!selectedNodePath) return null;
    return getNodeAtPath(tree, selectedNodePath);
  }, [tree, selectedNodePath]);

  // Show chapter create dialog automatically when no chapters exist
  const showCreatePanel = showChapterCreate || (!hasChapters && loaded);

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

        {/* Chapter tabs */}
        {hasChapters && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveChapterIdx(idx);
                  setCurrentPath([]);
                  setSelectedNodePath(null);
                  setEngineEval(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  idx === activeChapterIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {ch.name}
              </button>
            ))}
            <button
              onClick={() => setShowChapterCreate(true)}
              className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chapter creation panel */}
        <AnimatePresence>
          {showCreatePanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              {!showPgnImport ? (
                <div className="rounded-xl border border-border bg-card p-6 max-w-md mx-auto relative">
                  {/* Close button — only if there are already chapters */}
                  {hasChapters && (
                    <button
                      onClick={() => { setShowChapterCreate(false); setShowPgnImport(false); }}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <h3 className="text-base font-semibold text-foreground mb-3 text-center">
                    New Chapter
                  </h3>
                  <Input
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="Chapter name"
                    className="text-sm mb-4"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startFromPosition}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Play className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">Starting Position</span>
                      <span className="text-[0.65rem] text-muted-foreground text-center">Begin from the initial board</span>
                    </button>
                    <button
                      onClick={() => setShowPgnImport(true)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">Import PGN</span>
                      <span className="text-[0.65rem] text-muted-foreground text-center">Paste a PGN to import moves</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-6 max-w-lg mx-auto relative">
                  <button
                    onClick={() => { setShowChapterCreate(false); setShowPgnImport(false); setPgnInput(""); }}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="text-base font-semibold text-foreground mb-3">Import PGN</h3>
                  <Textarea
                    value={pgnInput}
                    onChange={(e) => setPgnInput(e.target.value)}
                    placeholder={'Paste PGN here...\ne.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5'}
                    className="text-sm min-h-[120px] resize-none font-mono mb-3"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowPgnImport(false); setPgnInput(""); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => importPgn(pgnInput)} disabled={!pgnInput.trim()}>
                      Import
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
                customArrows={nodeArrows}
                customHighlights={nodeHighlights}
                onRightClickDraw={handleArrowDraw}
                onRightClickSquare={handleSquareHighlight}
                nagOverlays={nagOverlays}
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
                  <InlineTreeView
                    tree={tree}
                    currentPath={currentPath}
                    selectedPath={selectedNodePath}
                    onNavigate={navigateTo}
                    onSelect={setSelectedNodePath}
                    onDelete={deleteNode}
                  />
                )}
              </div>
            </div>

            {/* Annotation panel */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">{t("annotation")}</h3>
              {currentPath.length > 0 && currentNode ? (
                <div className="space-y-3">
                  {/* NAG symbol selector */}
                  <TooltipProvider delayDuration={200}>
                    <div className="flex flex-wrap gap-1">
                      {NAG_SYMBOLS.map((sym) => (
                        <Tooltip key={sym.key}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => updateNag(currentNode!.nag === sym.key ? undefined : sym.key)}
                              className={`w-7 h-7 rounded flex items-center justify-center transition-all border ${
                                currentNode!.nag === sym.key
                                  ? "border-primary bg-primary/20 ring-1 ring-primary"
                                  : "border-border hover:border-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <img src={sym.icon} alt={sym.label} className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">{sym.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>

                  <Textarea
                    value={annotation}
                    onChange={(e) => updateAnnotation(e.target.value)}
                    placeholder="Add notes for this move..."
                    className="text-sm min-h-[80px] resize-none"
                  />

                  <p className="text-[0.6rem] text-muted-foreground">
                    Right-click drag on board to draw arrows. Right-click a square to highlight it.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Navigate to a move to annotate it.
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

// Get NAG icon path
function getNagIcon(nag?: NagSymbol): string | null {
  if (!nag) return null;
  const sym = NAG_SYMBOLS.find(s => s.key === nag);
  return sym ? sym.icon : null;
}

// ─── Inline Tree View (Lichess-style) ──────────────────────────────
// Main line goes straight down. Branches (siblings at index 1+) indent.

interface InlineTreeViewProps {
  tree: OpeningNode[];
  currentPath: TreePath;
  selectedPath: TreePath | null;
  onNavigate: (p: TreePath) => void;
  onSelect: (p: TreePath | null) => void;
  onDelete: (p: TreePath) => void;
}

function InlineTreeView({ tree, currentPath, selectedPath, onNavigate, onSelect, onDelete }: InlineTreeViewProps) {
  // Flatten the main line (always follow first child) and collect branches
  const elements: React.ReactNode[] = [];
  renderMainLine(tree, [], 0, elements, currentPath, selectedPath, onNavigate, onSelect, onDelete);
  return <div className="space-y-0.5">{elements}</div>;
}

function renderMainLine(
  nodes: OpeningNode[],
  basePath: TreePath,
  depth: number,
  elements: React.ReactNode[],
  currentPath: TreePath,
  selectedPath: TreePath | null,
  onNavigate: (p: TreePath) => void,
  onSelect: (p: TreePath | null) => void,
  onDelete: (p: TreePath) => void,
) {
  if (nodes.length === 0) return;

  // The main continuation is the first node (index 0)
  const mainNode = nodes[0];
  const mainPath = [...basePath, 0];

  // Render main node inline
  elements.push(
    <MoveRow
      key={mainPath.join("-")}
      node={mainNode}
      path={mainPath}
      currentPath={currentPath}
      selectedPath={selectedPath}
      onNavigate={onNavigate}
      onSelect={onSelect}
      onDelete={onDelete}
      indent={depth}
    />
  );

  // Render branches (siblings at index 1+) as indented sub-variations
  for (let i = 1; i < nodes.length; i++) {
    const branchPath = [...basePath, i];
    const branchElements: React.ReactNode[] = [];
    renderMainLine(
      [nodes[i]],
      // We need to render this branch node and its continuation
      basePath, // use the parent's basePath with index i
      depth + 1,
      branchElements,
      currentPath,
      selectedPath,
      onNavigate,
      onSelect,
      onDelete,
    );
    // Actually we need to render starting from the branch node itself
    // Let's do it properly:
    elements.push(
      <BranchBlock key={`branch-${branchPath.join("-")}`} depth={depth}>
        <SubLine
          node={nodes[i]}
          basePath={branchPath}
          depth={depth + 1}
          currentPath={currentPath}
          selectedPath={selectedPath}
          onNavigate={onNavigate}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </BranchBlock>
    );
  }

  // Continue the main line recursively
  if (mainNode.children.length > 0) {
    renderMainLine(
      mainNode.children,
      mainPath,
      depth,
      elements,
      currentPath,
      selectedPath,
      onNavigate,
      onSelect,
      onDelete,
    );
  }
}

function SubLine({
  node,
  basePath,
  depth,
  currentPath,
  selectedPath,
  onNavigate,
  onSelect,
  onDelete,
}: {
  node: OpeningNode;
  basePath: TreePath;
  depth: number;
  currentPath: TreePath;
  selectedPath: TreePath | null;
  onNavigate: (p: TreePath) => void;
  onSelect: (p: TreePath | null) => void;
  onDelete: (p: TreePath) => void;
}) {
  const elements: React.ReactNode[] = [];

  // Render this node
  elements.push(
    <MoveRow
      key={basePath.join("-")}
      node={node}
      path={basePath}
      currentPath={currentPath}
      selectedPath={selectedPath}
      onNavigate={onNavigate}
      onSelect={onSelect}
      onDelete={onDelete}
      indent={0}
    />
  );

  // Then render its children using the main-line logic
  if (node.children.length > 0) {
    renderMainLine(
      node.children,
      basePath,
      0,
      elements,
      currentPath,
      selectedPath,
      onNavigate,
      onSelect,
      onDelete,
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function BranchBlock({ children, depth }: { children: React.ReactNode; depth: number }) {
  return (
    <div className="ml-4 border-l-2 border-border/40 pl-2 my-1">
      {children}
    </div>
  );
}

function MoveRow({
  node,
  path,
  currentPath,
  selectedPath,
  onNavigate,
  onSelect,
  onDelete,
  indent,
}: {
  node: OpeningNode;
  path: TreePath;
  currentPath: TreePath;
  selectedPath: TreePath | null;
  onNavigate: (p: TreePath) => void;
  onSelect: (p: TreePath | null) => void;
  onDelete: (p: TreePath) => void;
  indent: number;
}) {
  const isCurrent = currentPath.length === path.length &&
    path.every((v, idx) => currentPath[idx] === v);
  const isSelected = selectedPath &&
    selectedPath.length === path.length &&
    path.every((v, idx) => selectedPath[idx] === v);
  const isOnPath = currentPath.length > path.length &&
    path.every((v, idx) => currentPath[idx] === v);

  const moveNum = path.length;
  const isWhiteMove = moveNum % 2 === 1;
  const displayNum = Math.ceil(moveNum / 2);
  const movePrefix = isWhiteMove ? `${displayNum}.` : `${displayNum}...`;

  const nagIcon = getNagIcon(node.nag);

  return (
    <div className="flex items-center group">
      <button
        onClick={() => {
          onNavigate(path);
          onSelect(path);
        }}
        className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
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
        {nagIcon && (
          <img src={nagIcon} alt="" className="w-3 h-3 ml-0.5 inline-block" />
        )}
      </button>
      {node.explanation && (
        <span className="text-[0.6rem] text-muted-foreground ml-1">💬</span>
      )}
      {(node.arrows?.length ?? 0) > 0 && (
        <span className="text-[0.6rem] text-muted-foreground ml-0.5">↗</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(path);
        }}
        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
