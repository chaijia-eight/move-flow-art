import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Check, X } from "lucide-react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import Chessboard from "@/components/Chessboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { getLineProgress, recordAttempt, markMastered, MASTERY_PROMPT_THRESHOLD } from "@/lib/progressStore";
import type { OpeningNode, MoveCategory } from "@/data/openings";
import ConfettiBurst from "@/components/ConfettiBurst";

interface RepertoireLine {
  id: string;
  moves: string[];
}

function extractLines(nodes: OpeningNode[], prefix: string[] = []): string[][] {
  if (nodes.length === 0) return [prefix];
  const result: string[][] = [];
  for (const node of nodes) {
    const path = [...prefix, node.move];
    if (node.children.length === 0) {
      result.push(path);
    } else {
      result.push(...extractLines(node.children, path));
    }
  }
  return result;
}

export default function RepertoireStudy() {
  const { repertoireId } = useParams<{ repertoireId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: repertoire, isLoading } = useQuery({
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

  const tree = useMemo(() => {
    return (repertoire?.tree || []) as unknown as OpeningNode[];
  }, [repertoire]);

  const side = (repertoire?.side || "w") as "w" | "b";

  // Extract all lines from the tree
  const allLines = useMemo((): RepertoireLine[] => {
    const raw = extractLines(tree);
    return raw.map((moves, i) => ({
      id: `repertoire-${repertoireId}-${i}`,
      moves,
    }));
  }, [tree, repertoireId]);

  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [lineComplete, setLineComplete] = useState(false);
  const [showMastery, setShowMastery] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const currentLine = allLines[currentLineIdx];
  const progressId = currentLine?.id || "";
  const progress = getLineProgress(progressId);

  // Reset line
  const resetLine = useCallback(() => {
    chess.reset();
    setFen(chess.fen());
    setMoveIndex(0);
    setFeedback(null);
    setLineComplete(false);
    setShowMastery(false);
    setMistakeCount(0);
  }, [chess]);

  // Auto-play opponent moves
  useEffect(() => {
    if (!currentLine || lineComplete) return;
    const isPlayerTurn = chess.turn() === side;
    if (!isPlayerTurn && moveIndex < currentLine.moves.length) {
      const timer = setTimeout(() => {
        const move = currentLine.moves[moveIndex];
        chess.move(move);
        setFen(chess.fen());
        setMoveIndex((mi) => mi + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [moveIndex, chess, currentLine, side, lineComplete]);

  // Check line completion
  useEffect(() => {
    if (currentLine && moveIndex >= currentLine.moves.length && !lineComplete) {
      setLineComplete(true);
      const wasCorrect = mistakeCount === 0;
      const result = recordAttempt(progressId, wasCorrect);
      if (wasCorrect && result.correctAttempts >= MASTERY_PROMPT_THRESHOLD && !result.mastered) {
        setShowMastery(true);
      }
    }
  }, [moveIndex, currentLine, lineComplete, mistakeCount, progressId]);

  // Handle player move
  const handleMove = useCallback((_from: string, _to: string, san: string) => {
    if (!currentLine || lineComplete) return;
    const expected = currentLine.moves[moveIndex];

    if (san === expected) {
      setFeedback("correct");
      setMoveIndex((mi) => mi + 1);
      setTimeout(() => setFeedback(null), 500);
    } else {
      setFeedback("wrong");
      setMistakeCount((m) => m + 1);
      // Undo the wrong move
      chess.undo();
      setFen(chess.fen());
      setTimeout(() => setFeedback(null), 800);
    }
  }, [currentLine, moveIndex, lineComplete, chess]);

  const handleMastery = useCallback((mastered: boolean) => {
    markMastered(progressId, mastered);
    setShowMastery(false);
    if (mastered) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [progressId]);

  const goToNextLine = useCallback(() => {
    if (currentLineIdx < allLines.length - 1) {
      setCurrentLineIdx((i) => i + 1);
      resetLine();
    }
  }, [currentLineIdx, allLines.length, resetLine]);

  // Move hints for player's turn
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!currentLine || lineComplete) return hints;
    const isPlayerTurn = chess.turn() === side;
    if (!isPlayerTurn) return hints;

    const legalMoves = chess.moves({ verbose: true });
    for (const m of legalMoves) {
      if (!hints.has(m.from)) {
        hints.set(m.from, { category: "main_line", targets: new Map() });
      }
      hints.get(m.from)!.targets.set(m.to, "main_line");
    }
    return hints;
  }, [fen, currentLine, lineComplete, side]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!repertoire || allLines.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No lines to study in this repertoire.</p>
        <Button variant="outline" onClick={() => navigate("/garden")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Garden
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfettiBurst trigger={showConfetti} />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/garden")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground">{repertoire.name}</h1>
              <p className="text-xs text-muted-foreground">
                Line {currentLineIdx + 1} of {allLines.length}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetLine}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: currentLine ? `${(moveIndex / currentLine.moves.length) * 100}%` : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Board */}
        <div className="aspect-square max-w-[500px] w-full mx-auto mb-4">
          <Chessboard
            fen={fen}
            onMove={handleMove}
            moveHints={moveHints}
            flipped={side === "b"}
            playerColor={side}
            disabled={lineComplete || chess.turn() !== side}
          />
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center text-sm font-medium mb-4 ${
                feedback === "correct" ? "text-green-500" : "text-destructive"
              }`}
            >
              {feedback === "correct" ? "✓ Correct!" : "✗ Try again"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Line complete */}
        {lineComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <p className="text-lg font-serif text-foreground">
              {mistakeCount === 0 ? "🎉 Perfect!" : `Completed with ${mistakeCount} mistake${mistakeCount > 1 ? "s" : ""}`}
            </p>

            {showMastery && (
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleMastery(false)}>
                  <X className="w-4 h-4 mr-1" /> Not yet
                </Button>
                <Button size="sm" onClick={() => handleMastery(true)}>
                  <Check className="w-4 h-4 mr-1" /> Mastered!
                </Button>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={resetLine}>
                <RotateCcw className="w-4 h-4 mr-1" /> Retry
              </Button>
              {currentLineIdx < allLines.length - 1 && (
                <Button size="sm" onClick={goToNextLine}>
                  Next Line →
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Need AnimatePresence import
import { AnimatePresence } from "framer-motion";
