import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import Chessboard from "@/components/Chessboard";
import FeedbackBanner from "@/components/FeedbackBanner";
import MoveHistory from "@/components/MoveHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { type OpeningNode, type MoveCategory } from "@/data/openings";
import { openings } from "@/data/openingTrees";
import { ArrowLeft, RotateCcw, Undo2, Redo2 } from "lucide-react";

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
}

interface HistorySnapshot {
  fen: string;
  currentNodes: OpeningNode[];
  moveHistory: MoveRecord[];
  moveCount: number;
  currentVariation: { name: string; description: string } | null;
}

export default function Study() {
  const { openingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();

  const opening = openings.find((o) => o.id === openingId);
  const colorParam = searchParams.get("color") as "w" | "b" | null;

  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

  // Player color: from URL param, fallback to opening's primary side
  const [playerColor, setPlayerColor] = useState<"w" | "b">(colorParam || opening?.primarySide || "w");

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [currentNodes, setCurrentNodes] = useState<OpeningNode[]>(opening?.tree || []);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [feedback, setFeedback] = useState<{
    type: MoveCategory;
    message: string;
    variationName?: string;
    suggestedMove?: string;
    alternativeNode?: OpeningNode;
    detectedOpening?: { id: string; name: string; nodes: OpeningNode[] };
  } | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [currentVariation, setCurrentVariation] = useState<{ name: string; description: string } | null>(null);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  const chess = chessRef.current;

  const saveSnapshot = (): HistorySnapshot => ({
    fen,
    currentNodes,
    moveHistory: [...moveHistory],
    moveCount,
    currentVariation,
  });

  const restoreSnapshot = (snap: HistorySnapshot) => {
    chess.load(snap.fen);
    setFen(snap.fen);
    setCurrentNodes(snap.currentNodes);
    setMoveHistory(snap.moveHistory);
    setMoveCount(snap.moveCount);
    setCurrentVariation(snap.currentVariation);
    setFeedback(null);
    setIsComputerTurn(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const current = saveSnapshot();
    setRedoStack((prev) => [current, ...prev]);
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    restoreSnapshot(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const current = saveSnapshot();
    setUndoStack((prev) => [...prev, current]);
    const next = redoStack[0];
    setRedoStack((s) => s.slice(1));
    restoreSnapshot(next);
  };

  // Auto-play computer's first move if computer goes first
  const initialAutoPlayed = useRef(false);
  useEffect(() => {
    if (initialAutoPlayed.current) return;
    if (!opening) return;
    // If it's the computer's turn at start (playerColor doesn't match first mover)
    const firstMover = "w"; // chess always starts with white
    if (playerColor !== firstMover && opening.tree.length > 0) {
      initialAutoPlayed.current = true;
      const mainNode = opening.tree.find((n) => n.category === "main_line") || opening.tree[0];
      setIsComputerTurn(true);
      setTimeout(() => {
        try {
          chess.move(mainNode.move);
          const newFen = chess.fen();
          setFen(newFen);
          setMoveHistory([{ san: mainNode.move, moveNumber: 1, isWhite: true }]);
          setCurrentNodes(mainNode.children);
          setUndoStack([{
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            currentNodes: opening.tree,
            moveHistory: [],
            moveCount: 0,
            currentVariation: null,
          }]);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  }, [opening, playerColor, chess]);

  // Search other openings' trees for a matching move sequence
  const findInOtherOpenings = useCallback((moveList: string[]): { id: string; name: string; nodes: OpeningNode[] } | null => {
    for (const op of openings) {
      if (op.id === openingId) continue;
      // Walk the tree matching moves in order
      let nodes = op.tree;
      let matched = true;
      for (const san of moveList) {
        const found = nodes.find((n) => n.move === san);
        if (!found) { matched = false; break; }
        nodes = found.children;
      }
      if (matched && moveList.length > 0) {
        return { id: op.id, name: op.name, nodes };
      }
    }
    return null;
  }, [openingId]);

  // Build move hints
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!currentNodes.length) return hints;
    const tempChess = new Chess(fen);
    const legalMoves = tempChess.moves({ verbose: true });
    currentNodes.forEach((node) => {
      const matching = legalMoves.find((m) => m.san === node.move);
      if (matching) {
        if (!hints.has(matching.from)) {
          hints.set(matching.from, { category: node.category, targets: new Map() });
        }
        hints.get(matching.from)!.targets.set(matching.to, node.category);
        hints.get(matching.from)!.targets.set(matching.san, node.category);
      }
    });
    return hints;
  }, [currentNodes, fen]);

  const autoPlayComputerMove = useCallback((children: OpeningNode[]) => {
    if (children.length === 0) return;
    const mainResponse = children.find((c) => c.category === "main_line");
    if (!mainResponse) return;

    setIsComputerTurn(true);
    setTimeout(() => {
      const snapBefore = {
        fen: chess.fen(),
        currentNodes: children,
        moveHistory: [...moveHistory],
        moveCount,
        currentVariation,
      };

      try {
        const result = chess.move(mainResponse.move);
        if (result) {
          const newFen = chess.fen();
          setFen(newFen);
          const isW = chess.turn() === "b";
          const mn = Math.ceil(chess.moveNumber());
          setMoveHistory((prev) => {
            const updated = [...prev, { san: mainResponse.move, moveNumber: isW ? mn : mn - 1, isWhite: isW }];
            return updated;
          });
          setCurrentNodes(mainResponse.children);
          if (mainResponse.variationName) {
            setCurrentVariation({
              name: mainResponse.variationName,
              description: `You're studying the ${mainResponse.variationName}.`,
            });
          }
          setUndoStack((prev) => [...prev, snapBefore]);
          setRedoStack([]);
        }
      } catch {}
      setIsComputerTurn(false);
      setFeedback(null);
    }, 800);
  }, [chess, moveHistory, moveCount, currentVariation]);

  const handleMove = useCallback(
    (from: string, to: string, san: string) => {
      if (isComputerTurn) return;

      const snapshot = saveSnapshot();
      const matchedNode = currentNodes.find((node) => node.move === san);

      try {
        chess.move({ from, to });
      } catch {
        return;
      }

      const newFen = chess.fen();
      setFen(newFen);

      const isWhite = chess.turn() === "b";
      const moveNum = Math.ceil(chess.moveNumber());
      const newHistory = [...moveHistory, { san, moveNumber: isWhite ? moveNum : moveNum - 1, isWhite }];
      setMoveHistory(newHistory);
      setMoveCount((c) => c + 1);
      setUndoStack((prev) => [...prev, snapshot]);
      setRedoStack([]);

      if (!matchedNode) {
        // Check if this move matches another opening's tree
        const allSans = newHistory.map((m) => m.san);
        const detected = findInOtherOpenings(allSans);
        if (detected) {
          setFeedback({
            type: "legit_alternative",
            message: `That's the ${detected.name}! Want to switch to studying that opening?`,
            variationName: detected.name,
            detectedOpening: detected,
          });
          setCurrentNodes(detected.nodes);
        } else {
          setFeedback({
            type: "main_line",
            message: "Interesting move. We don't have this in our study lines yet.",
          });
          setCurrentNodes([]);
        }
        return;
      }

      switch (matchedNode.category) {
        case "main_line":
          setFeedback({
            type: "main_line",
            message: matchedNode.variationName
              ? `Good. This is the ${matchedNode.variationName}.`
              : "Good. Let's continue.",
          });
          if (matchedNode.variationName) {
            setCurrentVariation({
              name: matchedNode.variationName,
              description: `You're studying the ${matchedNode.variationName}.`,
            });
          }
          setCurrentNodes(matchedNode.children);
          autoPlayComputerMove(matchedNode.children);
          break;

        case "legit_alternative":
          setFeedback({
            type: "legit_alternative",
            message: `This move is also good — it's called the ${matchedNode.variationName || "Alternative Line"}. Want to switch to studying that line?`,
            variationName: matchedNode.variationName,
            alternativeNode: matchedNode,
          });
          setCurrentNodes(matchedNode.children);
          setCurrentVariation({
            name: matchedNode.variationName || "Alternative Line",
            description: `You're now exploring the ${matchedNode.variationName || "Alternative Line"}.`,
          });
          break;

        case "mistake":
          chess.undo();
          setFen(chess.fen());
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndoStack((prev) => prev.slice(0, -1)); // remove snapshot we just pushed
          setFeedback({
            type: "mistake",
            message: matchedNode.explanation || "That's not the best move here.",
            suggestedMove: matchedNode.suggestedMove,
          });
          break;
      }
    },
    [chess, currentNodes, isComputerTurn, moveHistory, autoPlayComputerMove]
  );

  const handleReset = () => {
    initialAutoPlayed.current = false;
    chess.reset();
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setCurrentNodes(opening?.tree || []);
    setMoveHistory([]);
    setFeedback(null);
    setMoveCount(0);
    setIsComputerTurn(false);
    setCurrentVariation(null);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleColorSwitch = (color: "w" | "b") => {
    if (color === playerColor) return;
    setPlayerColor(color);
    initialAutoPlayed.current = false;
    chess.reset();
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setCurrentNodes(opening?.tree || []);
    setMoveHistory([]);
    setFeedback(null);
    setMoveCount(0);
    setIsComputerTurn(false);
    setCurrentVariation(null);
    setUndoStack([]);
    setRedoStack([]);

    // Auto-play if computer goes first
    if (color !== "w" && opening && opening.tree.length > 0) {
      const mainNode = opening.tree.find((n) => n.category === "main_line") || opening.tree[0];
      initialAutoPlayed.current = true;
      setIsComputerTurn(true);
      setTimeout(() => {
        try {
          chess.move(mainNode.move);
          setFen(chess.fen());
          setMoveHistory([{ san: mainNode.move, moveNumber: 1, isWhite: true }]);
          setCurrentNodes(mainNode.children);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  };

  if (!opening) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Opening not found.</p>
      </div>
    );
  }

  const sideLabel = playerColor === opening.primarySide
    ? `Play as ${playerColor === "w" ? "White" : "Black"}`
    : `Play against (as ${playerColor === "w" ? "White" : "Black"})`;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${currentTheme.primaryColor}15, transparent 60%), radial-gradient(ellipse at 80% 100%, ${currentTheme.accentColor}08, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">{opening.name}</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {sideLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border/50 mr-2">
            <button
              onClick={() => handleColorSwitch("w")}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-300"
              style={{
                background: playerColor === "w" ? currentTheme.accentColor : "transparent",
                color: playerColor === "w" ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              White
            </button>
            <button
              onClick={() => handleColorSwitch("b")}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-300"
              style={{
                background: playerColor === "b" ? currentTheme.accentColor : "transparent",
                color: playerColor === "b" ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              Black
            </button>
          </div>

          {/* Undo / Redo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={undoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRedo}
            disabled={redoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-5 h-5 text-foreground/70" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: -20 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-2.5 rounded-lg hover:bg-accent transition-colors"
            title="Reset board"
          >
            <RotateCcw className="w-5 h-5 text-foreground/70" />
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Board section */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
            <Chessboard
              fen={fen}
              onMove={handleMove}
              moveHints={moveHints}
              disabled={isComputerTurn}
              flipped={playerColor === "b"}
            />

            {/* Feedback area */}
            <div className="mt-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                {feedback && (
                  <FeedbackBanner
                    key={`${feedback.type}-${moveCount}`}
                    type={feedback.type}
                    message={feedback.message}
                    variationName={feedback.variationName}
                    suggestedMove={feedback.suggestedMove}
                    onSwitch={() => {
                      if (feedback.detectedOpening) {
                        // Navigate to the detected opening
                        navigate(`/study/${feedback.detectedOpening.id}`);
                      } else {
                        setFeedback({
                          type: "main_line",
                          message: `Switched to the ${feedback.variationName}. Let's explore this line.`,
                        });
                      }
                    }}
                    onStay={() => {
                      setFeedback(null);
                      handleUndo();
                    }}
                    onRetry={() => setFeedback(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-72 space-y-4">
            <MoveHistory moves={moveHistory} />

            {/* Opening info card */}
            <motion.div
              key={currentVariation?.name || "base"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-4"
              style={{ background: "hsl(var(--card))" }}
            >
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                {currentVariation ? currentVariation.name : "About This Opening"}
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {currentVariation ? currentVariation.description : opening.description}
              </p>
            </motion.div>

            {/* Available lines */}
            {currentNodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-4"
                style={{ background: "hsl(var(--card))" }}
              >
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Available Lines
                </h4>
                <div className="space-y-1.5">
                  {currentNodes
                    .filter((n) => n.category !== "mistake")
                    .map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              node.category === "main_line"
                                ? "hsl(42, 90%, 55%)"
                                : "hsl(180, 40%, 55%)",
                          }}
                        />
                        <span className="font-mono text-sm text-foreground/70">{node.move}</span>
                        {node.variationName && (
                          <span className="text-xs italic text-muted-foreground">
                            {node.variationName}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
