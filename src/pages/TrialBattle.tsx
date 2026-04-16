import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, ChevronRight, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Chessboard from "@/components/Chessboard";
import ConfettiBurst from "@/components/ConfettiBurst";
import { getPillar, getFloor, TRIALS_TO_PASS } from "@/data/pillarTrials";
import { XP_REWARDS, EMBER_REWARDS } from "@/data/rpgData";
import { usePlayerCharacter } from "@/hooks/usePlayerCharacter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";

export default function TrialBattle() {
  const { pillarId, floorNum } = useParams<{ pillarId: string; floorNum: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addXpAndEmbers } = usePlayerCharacter();

  const pillar = getPillar(pillarId || "");
  const floorIndex = parseInt(floorNum || "1") - 1;
  const floor = pillar ? getFloor(pillar.id, floorIndex) : undefined;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayFen, setDisplayFen] = useState<string | null>(null);

  const trials = floor?.trials || [];
  const current = trials[currentIndex];

  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!current) return hints;
    try {
      const game = new Chess(current.fen);
      const moves = game.moves({ verbose: true });
      for (const m of moves) {
        if (!hints.has(m.from)) {
          hints.set(m.from, { category: "main" as MoveCategory, targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main" as MoveCategory);
      }
    } catch {}
    return hints;
  }, [current]);

  const bestMoveArrow = useMemo(() => {
    if (!current || feedback !== "wrong") return undefined;
    try {
      const game = new Chess(current.fen);
      const move = game.move(current.solutionSan);
      if (move) return { from: move.from, to: move.to };
    } catch {}
    return undefined;
  }, [current, feedback]);

  const playerColor = useMemo(() => {
    if (!current) return "w" as const;
    return current.fen.split(" ")[1] === "w" ? ("w" as const) : ("b" as const);
  }, [current]);

  const handleMove = useCallback(
    (_from: string, _to: string, san: string) => {
      if (!current || feedback) return;
      const cleanSan = san.replace(/[+#]/g, "");
      const cleanSolution = current.solutionSan.replace(/[+#]/g, "");
      const isCorrect = cleanSan === cleanSolution;

      setScore((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        try {
          const game = new Chess(current.fen);
          game.move(current.solutionSan);
          setDisplayFen(game.fen());
        } catch {}
      }
    },
    [current, feedback]
  );

  const advance = useCallback(() => {
    setFeedback(null);
    setShowHint(false);
    setDisplayFen(null);
    if (currentIndex + 1 >= trials.length) {
      completeTrial();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, trials.length]);

  const completeTrial = async () => {
    setFinished(true);
    const passed = score.correct >= TRIALS_TO_PASS;
    const perfect = score.correct === trials.length;

    if (passed) setShowConfetti(true);

    const xp = XP_REWARDS.trialBase * trials.length * (perfect ? XP_REWARDS.perfectMultiplier : 1);
    const embers = passed ? EMBER_REWARDS.pillarFloorClear + (perfect ? EMBER_REWARDS.perfectTrial : 0) : 5;

    try {
      await addXpAndEmbers.mutateAsync({ xp, embers });

      if (passed && user) {
        // Upsert pillar progress
        const { data: existing } = await supabase
          .from("pillar_progress" as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("pillar", pillarId!)
          .maybeSingle();

        const currentFloorNum = parseInt(floorNum || "1");
        if (existing) {
          const newFloor = Math.max((existing as any).current_floor, currentFloorNum + 1);
          await supabase
            .from("pillar_progress" as any)
            .update({
              current_floor: newFloor,
              trials_completed: (existing as any).trials_completed + score.correct,
              total_trials_mastered: (existing as any).total_trials_mastered + (perfect ? trials.length : score.correct),
            } as any)
            .eq("user_id", user.id)
            .eq("pillar", pillarId!);
        } else {
          await supabase.from("pillar_progress" as any).insert({
            user_id: user.id,
            pillar: pillarId!,
            current_floor: currentFloorNum + 1,
            trials_completed: score.correct,
            total_trials_mastered: perfect ? trials.length : score.correct,
          } as any);
        }

        // Insert trial history
        await supabase.from("trial_history" as any).insert({
          user_id: user.id,
          pillar: pillarId!,
          floor_number: currentFloorNum,
          trial_number: 1,
          best_accuracy: score.correct / trials.length,
          passed: true,
          perfect_clear: perfect,
          mastered_at: new Date().toISOString(),
        } as any);
      }

      queryClient.invalidateQueries({ queryKey: ["pillar-progress"] });
      queryClient.invalidateQueries({ queryKey: ["pillar-detail"] });
      queryClient.invalidateQueries({ queryKey: ["trial-history"] });
      queryClient.invalidateQueries({ queryKey: ["player-character"] });
    } catch (e) {
      console.error("Failed to save trial:", e);
    }
  };

  if (!pillar || !floor || trials.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">No trials available for this floor.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (finished) {
    const passed = score.correct >= TRIALS_TO_PASS;
    const perfect = score.correct === trials.length;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ConfettiBurst trigger={showConfetti} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 max-w-md"
        >
          <div className="text-6xl mb-4">{perfect ? "👑" : passed ? "⚔️" : "💀"}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {perfect ? "PERFECT CLEAR" : passed ? "Floor Cleared!" : "Defeated"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {score.correct} / {trials.length} trials passed
          </p>
          <p className="text-sm text-orange-400 mb-6">
            +{XP_REWARDS.trialBase * trials.length * (perfect ? 2 : 1)} XP · +{passed ? EMBER_REWARDS.pillarFloorClear : 5} 🔥
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(`/pillar/${pillarId}`)}>
              Back to Pillar
            </Button>
            {!passed && (
              <Button onClick={() => { setFinished(false); setCurrentIndex(0); setScore({ correct: 0, total: 0 }); setFeedback(null); setDisplayFen(null); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/pillar/${pillarId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-foreground">{floor.name}</h1>
            <p className="text-xs text-muted-foreground">
              Trial {currentIndex + 1} of {trials.length}
            </p>
          </div>
          <span className="text-sm font-bold text-foreground">
            {score.correct}/{score.total}
          </span>
        </div>

        <Progress value={((currentIndex + 1) / trials.length) * 100} className="h-1.5 mb-4" />

        {/* Board */}
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-[400px] aspect-square">
            <Chessboard
              fen={displayFen || current.fen}
              onMove={handleMove}
              moveHints={feedback ? new Map() : moveHints}
              disabled={!!feedback}
              flipped={playerColor === "b"}
              playerColor={playerColor}
              arrowFrom={bestMoveArrow?.from}
              arrowTo={bestMoveArrow?.to}
            />
          </div>
        </div>

        {/* Hint */}
        {!feedback && !showHint && (
          <div className="flex justify-center mb-4">
            <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="text-muted-foreground">
              <Lightbulb className="w-4 h-4 mr-1" /> Hint
            </Button>
          </div>
        )}
        {showHint && !feedback && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-yellow-400/80 mb-4"
          >
            💡 {current.hint}
          </motion.p>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl text-center mb-4 ${
                feedback === "correct"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <p className={`font-bold ${feedback === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                {feedback === "correct" ? "⚔️ Strike!" : "💀 Missed"}
              </p>
              {feedback === "wrong" && (
                <p className="text-sm text-muted-foreground mt-1">
                  The answer was <span className="text-foreground font-mono">{current.solutionSan}</span>
                </p>
              )}
              <Button size="sm" className="mt-3" onClick={advance}>
                {currentIndex + 1 >= trials.length ? "Finish" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
