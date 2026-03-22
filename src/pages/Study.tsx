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
import { extractLinesForVariation, type Line } from "@/lib/lineExtractor";
import {
  getLineProgress,
  recordAttempt,
  markMastered,
  isLineUnlocked,
  MASTERY_PROMPT_THRESHOLD,
} from "@/lib/progressStore";
import { ArrowLeft, RotateCcw, Undo2, Redo2, Trophy, ChevronRight } from "lucide-react";

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
  const variationParam = searchParams.get("variation");
  const lineParam = searchParams.get("line");
  const isReview = searchParams.get("review") === "1";

  // Resolve current line
  const { currentLine, allVariationLines } = useMemo(() => {
    if (!opening || !variationParam) return { currentLine: null, allVariationLines: [] };
    const variation = opening.variations.find((v) => v.id === variationParam);
    if (!variation) return { currentLine: null, allVariationLines: [] };
    const lines = extractLinesForVariation(opening, variation);
    const lineIdx = lineParam !== null ? parseInt(lineParam, 10) : 0;
    return {
      currentLine: lines[lineIdx] || null,
      allVariationLines: lines,
    };
  }, [opening, variationParam, lineParam]);

  // Parse the preferred variation's starting moves into a SAN sequence
  const preferredMoves = useMemo(() => {
    if (currentLine) return currentLine.moves;
    if (!variationParam || !opening) return null;
    const variation = opening.variations.find((v) => v.id === variationParam);
    if (!variation?.startingMoves) return null;
    return variation.startingMoves
      .replace(/\d+\./g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }, [currentLine, variationParam, opening]);

  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

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
  const [resetCounter, setResetCounter] = useState(0);
  const [currentVariation, setCurrentVariation] = useState<{ name: string; description: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);

  // Mastery prompt state
  const [showMasteryPrompt, setShowMasteryPrompt] = useState(false);
  const [lineCompleted, setLineCompleted] = useState(false);

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

  const pickComputerNode = useCallback((children: OpeningNode[], moveIndex: number): OpeningNode | null => {
    if (children.length === 0) return null;
    if (preferredMoves && moveIndex < preferredMoves.length) {
      const preferredSan = preferredMoves[moveIndex];
      const preferred = children.find((c) => c.move === preferredSan);
      if (preferred) return preferred;
    }
    return children.find((c) => c.category === "main_line") || children[0];
  }, [preferredMoves]);

  // Handle line completion
  const handleLineComplete = useCallback((wasCorrect: boolean) => {
    if (!currentLine) return;
    const progress = recordAttempt(currentLine.id, wasCorrect);
    setLineCompleted(true);

    if (wasCorrect && !progress.mastered && progress.correctAttempts >= MASTERY_PROMPT_THRESHOLD) {
      // Show mastery prompt
      setTimeout(() => setShowMasteryPrompt(true), 800);
    }
  }, [currentLine]);

  // Check if the line is complete (no more nodes + all moves played)
  const checkLineCompletion = useCallback((nodes: OpeningNode[]) => {
    if (nodes.length === 0 && !lineCompleted && currentLine) {
      handleLineComplete(!hadMistake);
    }
  }, [lineCompleted, currentLine, hadMistake, handleLineComplete]);

  const initialAutoPlayed = useRef(false);
  useEffect(() => {
    if (initialAutoPlayed.current) return;
    if (!opening) return;
    const firstMover = "w";
    if (playerColor !== firstMover && opening.tree.length > 0) {
      initialAutoPlayed.current = true;
      const mainNode = pickComputerNode(opening.tree, 0) || opening.tree[0];
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
          checkLineCompletion(mainNode.children);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  }, [opening, playerColor, chess]);

  const findInOtherOpenings = useCallback((moveList: string[]): { id: string; name: string; nodes: OpeningNode[] } | null => {
    for (const op of openings) {
      if (op.id === openingId) continue;
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

  const autoPlayComputerMove = useCallback((children: OpeningNode[], moveIndex: number) => {
    const chosen = pickComputerNode(children, moveIndex);
    if (!chosen) {
      checkLineCompletion(children);
      return;
    }

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
        const result = chess.move(chosen.move);
        if (result) {
          const newFen = chess.fen();
          setFen(newFen);
          const isW = chess.turn() === "b";
          const mn = Math.ceil(chess.moveNumber());
          setMoveHistory((prev) => {
            const updated = [...prev, { san: chosen.move, moveNumber: isW ? mn : mn - 1, isWhite: isW }];
            return updated;
          });
          setCurrentNodes(chosen.children);
          if (chosen.variationName) {
            setCurrentVariation({
              name: chosen.variationName,
              description: `You're studying the ${chosen.variationName}.`,
            });
          }
          setUndoStack((prev) => [...prev, snapBefore]);
          setRedoStack([]);
          checkLineCompletion(chosen.children);
        }
      } catch {}
      setIsComputerTurn(false);
      setFeedback(null);
    }, 800);
  }, [chess, moveHistory, moveCount, currentVariation, checkLineCompletion]);

  const handleMove = useCallback(
    (from: string, to: string, san: string) => {
      if (isComputerTurn || lineCompleted) return;

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
        setHadMistake(true);
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
          autoPlayComputerMove(matchedNode.children, newHistory.length);
          break;

        case "legit_alternative":
          setFeedback({
            type: "legit_alternative",
            message: `This move is also good — it's called the ${matchedNode.variationName || "Alternative Line"}.`,
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
          setUndoStack((prev) => prev.slice(0, -1));
          setHadMistake(true);
          setFeedback({
            type: "mistake",
            message: matchedNode.explanation || "That's not the best move here.",
            suggestedMove: matchedNode.suggestedMove,
          });
          break;
      }
    },
    [chess, currentNodes, isComputerTurn, moveHistory, autoPlayComputerMove, lineCompleted, findInOtherOpenings]
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
    setHadMistake(false);
    setLineCompleted(false);
    setShowMasteryPrompt(false);
  };

  const handleColorSwitch = (color: "w" | "b") => {
    if (color === playerColor) return;
    setPlayerColor(color);
    handleReset();

    if (color !== "w" && opening && opening.tree.length > 0) {
      const mainNode = pickComputerNode(opening.tree, 0) || opening.tree[0];
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

  const handleMasteryResponse = (mastered: boolean) => {
    if (currentLine) {
      markMastered(currentLine.id, mastered);
    }
    setShowMasteryPrompt(false);
  };

  const goToNextLine = () => {
    if (!currentLine || !variationParam) return;
    const currentIdx = allVariationLines.findIndex((l) => l.id === currentLine.id);
    if (currentIdx < allVariationLines.length - 1) {
      navigate(
        `/study/${openingId}/play?color=${colorParam || opening?.primarySide || "w"}&variation=${variationParam}&line=${currentIdx + 1}`,
        { replace: true }
      );
      // Force full reset for new line
      window.location.reload();
    } else {
      navigate(`/study/${openingId}`);
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

  const displayName = currentLine
    ? currentLine.name
    : currentVariation
    ? currentVariation.name
    : opening.name;

  const lineProgress = currentLine ? getLineProgress(currentLine.id) : null;

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
            onClick={() => navigate(`/study/${openingId}`)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              {displayName}
            </h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {sideLabel}
              {isReview && " · Review Mode"}
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

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleUndo} disabled={undoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Undo"
          >
            <Undo2 className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRedo} disabled={redoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Redo"
          >
            <Redo2 className="w-5 h-5 text-foreground/70" />
          </motion.button>

          <motion.button whileHover={{ scale: 1.05, rotate: -20 }} whileTap={{ scale: 0.95 }}
            onClick={handleReset} className="p-2.5 rounded-lg hover:bg-accent transition-colors" title="Reset board"
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
              disabled={isComputerTurn || lineCompleted}
              flipped={playerColor === "b"}
            />

            {/* Feedback area */}
            <div className="mt-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                {/* Line completed overlay */}
                {lineCompleted && !showMasteryPrompt && (
                  <motion.div
                    key="line-complete"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accentColor}15, ${currentTheme.primaryColor}10)`,
                      border: `1px solid ${currentTheme.accentColor}30`,
                    }}
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.accentColor }} />
                    <p className="font-serif text-lg font-semibold text-foreground mb-1">
                      {hadMistake ? "Line Completed" : "Perfect Run!"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {hadMistake
                        ? "You made it through, but had some mistakes. Try again for a perfect run!"
                        : `Great job! ${lineProgress ? `${lineProgress.correctAttempts + 1} correct attempt${lineProgress.correctAttempts > 0 ? "s" : ""}.` : ""}`}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-border/50 text-foreground/70 hover:bg-accent transition-colors"
                      >
                        Practice Again
                      </motion.button>
                      {allVariationLines.length > 0 && currentLine && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={goToNextLine}
                          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                          style={{
                            background: currentTheme.accentColor,
                            color: "hsl(var(--background))",
                          }}
                        >
                          {allVariationLines.findIndex((l) => l.id === currentLine.id) < allVariationLines.length - 1
                            ? <>Next Line <ChevronRight className="w-4 h-4" /></>
                            : "Back to Hub"}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Mastery prompt */}
                {showMasteryPrompt && (
                  <motion.div
                    key="mastery-prompt"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accentColor}20, ${currentTheme.primaryColor}15)`,
                      border: `1px solid ${currentTheme.accentColor}40`,
                    }}
                  >
                    <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: currentTheme.accentColor }} />
                    <p className="font-serif text-xl font-semibold text-foreground mb-2">
                      Do you think you've mastered this line?
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You've completed it {lineProgress ? lineProgress.correctAttempts + 1 : MASTERY_PROMPT_THRESHOLD} times correctly.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMasteryResponse(false)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border/50 text-foreground/70 hover:bg-accent transition-colors"
                      >
                        Not yet, keep practicing
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMasteryResponse(true)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: currentTheme.accentColor,
                          color: "hsl(var(--background))",
                        }}
                      >
                        Yes, I've mastered it!
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Normal feedback */}
                {feedback && !lineCompleted && !showMasteryPrompt && (
                  <FeedbackBanner
                    key={`${feedback.type}-${moveCount}`}
                    type={feedback.type}
                    message={feedback.message}
                    variationName={feedback.variationName}
                    suggestedMove={feedback.suggestedMove}
                    onSwitch={() => {
                      if (feedback.detectedOpening) {
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

            {/* Line progress card */}
            {currentLine && lineProgress && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4"
                style={{ background: "hsl(var(--card))" }}
              >
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Line Progress
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{lineProgress.correctAttempts} correct</span>
                      <span>{lineProgress.attempts} total</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (lineProgress.correctAttempts / MASTERY_PROMPT_THRESHOLD) * 100)}%`,
                          background: lineProgress.mastered
                            ? currentTheme.accentColor
                            : currentTheme.primaryColor,
                        }}
                      />
                    </div>
                  </div>
                  {lineProgress.mastered && (
                    <Trophy className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.accentColor }} />
                  )}
                </div>
              </motion.div>
            )}

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

            {/* Available lines — only show on player's turn */}
            {currentNodes.length > 0 && !isComputerTurn && chess.turn() === playerColor && !lineCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-4"
                style={{ background: "hsl(var(--card))" }}
              >
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Your Options
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
