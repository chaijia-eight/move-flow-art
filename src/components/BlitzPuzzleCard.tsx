import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import Chessboard from "@/components/Chessboard";
import type { SeedPuzzle } from "@/data/seedPuzzles";

interface BlitzPuzzleCardProps {
  puzzle: SeedPuzzle;
  isActive: boolean;
  onAdvance: () => void;
  index: number;
  total: number;
}

type Status = "playing" | "wrong" | "solved";

/** Strip + and # from a SAN string so equality comparison is forgiving. */
function normalizeSan(san: string): string {
  return san.replace(/[+#]/g, "");
}

export default function BlitzPuzzleCard({
  puzzle,
  isActive,
  onAdvance,
  index,
  total,
}: BlitzPuzzleCardProps) {
  const chessRef = useRef(new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [status, setStatus] = useState<Status>("playing");
  const [moveIndex, setMoveIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset puzzle state when it scrolls back into view (or first mount).
  useEffect(() => {
    if (!isActive) return;
    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setStatus("playing");
    setMoveIndex(0);
    setShowHint(false);
    setFeedback(null);
  }, [isActive, puzzle.fen]);

  const handleReset = () => {
    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setStatus("playing");
    setMoveIndex(0);
    setFeedback(null);
  };

  const handleMove = (from: string, to: string, san: string) => {
    if (status !== "playing") return;

    const expected = puzzle.solutionSan[moveIndex];
    const userSan = normalizeSan(san);
    const expectedSan = normalizeSan(expected);

    if (userSan !== expectedSan) {
      // Roll back the move on the engine so the visible position matches state.
      try {
        chessRef.current.undo();
      } catch {
        /* noop */
      }
      setFen(chessRef.current.fen());
      setStatus("wrong");
      setFeedback("Not quite. Try again.");
      return;
    }

    // Correct move from the player. Apply it (chess.js already advanced via
    // Chessboard's optimistic onMove; here we keep our local engine in sync).
    try {
      chessRef.current.move({ from, to, promotion: "q" });
    } catch {
      /* engine already in sync if Chessboard applied it */
    }

    const nextIndex = moveIndex + 1;

    // If the puzzle has more moves, the next one is the opponent's reply.
    if (nextIndex < puzzle.solutionSan.length) {
      const replySan = puzzle.solutionSan[nextIndex];
      setTimeout(() => {
        try {
          chessRef.current.move(replySan);
          setFen(chessRef.current.fen());
          setMoveIndex(nextIndex + 1);
          if (nextIndex + 1 >= puzzle.solutionSan.length) {
            setStatus("solved");
            setFeedback("Solved.");
          }
        } catch {
          // Shouldn't happen with a valid solution; just mark solved.
          setStatus("solved");
        }
      }, 350);
      setMoveIndex(nextIndex);
    } else {
      // No reply scheduled — puzzle is done.
      setFen(chessRef.current.fen());
      setMoveIndex(nextIndex);
      setStatus("solved");
      setFeedback("Solved.");
    }
  };

  const moveHints = useMemo(() => new Map(), []);

  return (
    <div className="h-full w-full flex flex-col bg-background relative snap-start snap-always">
      {/* Top meta bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>
          {index + 1} / {total}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {puzzle.weaknessTag.replace(/_/g, " ")}
        </span>
      </div>

      {/* Title */}
      <div className="px-5 pb-3">
        <h2 className="text-xl font-bold text-foreground">{puzzle.title}</h2>
        <p className="text-sm text-muted-foreground">
          {puzzle.playerColor === "w" ? "White" : "Black"} to move · difficulty{" "}
          {puzzle.difficulty}/10
        </p>
      </div>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center px-3">
        <div className="w-full max-w-[420px] aspect-square">
          <Chessboard
            fen={fen}
            onMove={handleMove}
            moveHints={moveHints}
            disabled={status !== "playing"}
            flipped={puzzle.playerColor === "b"}
            playerColor={puzzle.playerColor}
          />
        </div>
      </div>

      {/* Feedback + actions */}
      <div className="px-5 pb-6 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={feedback + status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`text-sm rounded-lg px-3 py-2 ${
                status === "solved"
                  ? "bg-primary/10 text-primary"
                  : status === "wrong"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-foreground"
              }`}
            >
              {feedback}
            </motion.div>
          )}

          {showHint && status === "playing" && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm rounded-lg px-3 py-2 bg-secondary text-foreground"
            >
              <Lightbulb className="inline w-4 h-4 mr-1 -mt-0.5" />
              {puzzle.hint}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          {status === "playing" && (
            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex-1 h-11 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hide hint" : "Hint"}
            </button>
          )}
          {status === "wrong" && (
            <button
              onClick={handleReset}
              className="flex-1 h-11 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          )}
          {status === "solved" && (
            <button
              onClick={onAdvance}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Next puzzle
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}