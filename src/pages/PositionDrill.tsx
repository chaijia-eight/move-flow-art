import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SkipForward, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Chessboard from "@/components/Chessboard";
import { Chess } from "chess.js";

interface DrillPosition {
  id: string;
  fen: string;
  category: string;
  move_number: number;
  your_move_san: string;
  engine_best_san: string;
  eval_before: number | null;
  eval_after: number | null;
  difficulty_score: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  blunder: "Blunders",
  missed_tactic: "Missed Tactics",
  defensive_crux: "Defensive Drills",
  endgame_tech: "Endgame Technique",
};

type MoveCategory = "main" | "correct" | "wrong" | "alt";

export default function PositionDrill() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [positions, setPositions] = useState<DrillPosition[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [playerMove, setPlayerMove] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !category) return;
    (async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", category)
        .order("difficulty_score", { ascending: false })
        .limit(20);
      setPositions(data ?? []);
      setLoading(false);
    })();
  }, [user, category]);

  const current = positions[currentIndex];

  const advance = useCallback(() => {
    if (currentIndex + 1 >= positions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
      setPlayerMove(null);
    }
  }, [currentIndex, positions.length]);

  // Build move hints so legal moves are shown on the board
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!current || feedback) return hints;
    try {
      const chess = new Chess(current.fen);
      const moves = chess.moves({ verbose: true });
      for (const m of moves) {
        if (!hints.has(m.from)) {
          hints.set(m.from, { category: "main", targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main");
      }
    } catch { /* ignore */ }
    return hints;
  }, [current, feedback]);

  const handleMove = useCallback((_from: string, _to: string, san: string) => {
    if (!current || feedback) return;

    // Normalize SAN for comparison (strip +, #)
    const normalize = (s: string) => s.replace(/[+#]/g, "").trim();
    const played = normalize(san);
    const best = normalize(current.engine_best_san || "");

    setPlayerMove(san);

    if (played === best) {
      setFeedback("correct");
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setFeedback("wrong");
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  }, [current, feedback]);

  const handleSkip = () => {
    setScore((s) => ({ ...s, skipped: s.skipped + 1 }));
    advance();
  };

  const restart = () => {
    setCurrentIndex(0);
    setFeedback(null);
    setPlayerMove(null);
    setScore({ correct: 0, wrong: 0, skipped: 0 });
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading positions…</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/decks")} className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Decks
          </Button>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No positions found for this category.</p>
            <p className="text-muted-foreground/70 text-sm mt-2">Analyze some games first to populate drill positions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const total = score.correct + score.wrong + score.skipped;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/decks")} className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Decks
          </Button>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card p-8 text-center"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Drill Complete!</h2>
            <p className="text-4xl font-bold text-primary mb-1">{pct}%</p>
            <p className="text-muted-foreground text-sm mb-6">
              {score.correct} correct · {score.wrong} wrong · {score.skipped} skipped
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={restart} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button onClick={() => navigate("/decks")}>
                Back to Decks
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const turnFromFen = current.fen.split(" ")[1];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/decks")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[category || ""] || category}
            </p>
            <p className="text-sm font-medium text-foreground">
              {currentIndex + 1} / {positions.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((currentIndex) / positions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Prompt */}
        <p className="text-sm text-muted-foreground mb-2 text-center">
          {turnFromFen === "w" ? "White" : "Black"} to move — find the best move!
        </p>

        {/* Board */}
        <div className="max-w-[400px] mx-auto mb-4">
          <Chessboard
            fen={current.fen}
            flipped={turnFromFen === "b"}
            onMove={handleMove}
            moveHints={moveHints}
            disabled={!!feedback}
            playerColor={turnFromFen as "w" | "b"}
          />
        </div>

        {/* Feedback area */}
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Button variant="ghost" onClick={handleSkip} className="gap-2 text-muted-foreground">
                <SkipForward className="w-4 h-4" /> Skip
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              {feedback === "correct" ? (
                <p className="text-center text-lg font-bold text-emerald-400">✓ Correct!</p>
              ) : (
                <>
                  <p className="text-center text-lg font-bold text-red-400">✗ Incorrect</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-muted-foreground mb-1">You played</p>
                      <p className="text-lg font-bold text-foreground">{playerMove}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Best move</p>
                      <p className="text-lg font-bold text-foreground">{current.engine_best_san}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-center">
                <Button onClick={advance} className="gap-2">
                  Next →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score bar */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <span className="text-emerald-400">✓ {score.correct}</span>
          <span className="text-red-400">✗ {score.wrong}</span>
          <span>⏭ {score.skipped}</span>
        </div>
      </div>
    </div>
  );
}
