import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import Chessboard from "@/components/Chessboard";
import EvalBar from "@/components/EvalBar";
import ConfettiBurst from "@/components/ConfettiBurst";
import { getNodeById, getStars, type CampaignPuzzle } from "@/data/campaignData";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";

export default function CampaignDrill() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const node = getNodeById(nodeId ?? "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showBestMove, setShowBestMove] = useState(false);
  const [displayFen, setDisplayFen] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const puzzles = node?.puzzles ?? [];
  const current = puzzles[currentIndex] as CampaignPuzzle | undefined;

  const moveHints = useMemo(() => {
    if (!current) return new Map();
    const chess = new Chess(current.fen);
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    for (const move of chess.moves({ verbose: true })) {
      const existing = hints.get(move.from);
      const targets = existing?.targets ?? new Map<string, MoveCategory>();
      targets.set(move.to, "main_line");
      hints.set(move.from, { category: "main_line", targets });
    }
    return hints;
  }, [current]);

  const bestMoveArrow = useMemo(() => {
    if (!current?.solutionSan || !showBestMove) return { from: undefined, to: undefined };
    try {
      const chess = new Chess(current.fen);
      const move = chess.move(current.solutionSan);
      if (move) return { from: move.from, to: move.to };
    } catch {}
    return { from: undefined, to: undefined };
  }, [current, showBestMove]);

  const playerColor = useMemo(() => {
    if (!current) return "w" as const;
    return current.fen.includes(" b ") ? "b" as const : "w" as const;
  }, [current]);

  const handleMove = useCallback(
    (_from: string, _to: string, san: string) => {
      if (!current || feedback) return;
      const bestSan = current.solutionSan.replace(/[+#]/g, "");
      const playerSan = san.replace(/[+#]/g, "");
      const isCorrect = playerSan === bestSan;

      setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        try {
          const chess = new Chess(current.fen);
          chess.move(san);
          setDisplayFen(chess.fen());
        } catch {}
      } else {
        setShowBestMove(true);
      }
    },
    [current, feedback]
  );

  const advance = useCallback(() => {
    setFeedback(null);
    setShowBestMove(false);
    setDisplayFen(null);
    const next = currentIndex + 1;
    if (next >= puzzles.length) {
      completeDrill();
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, puzzles.length]);

  const completeDrill = useCallback(async () => {
    setFinished(true);
    const stars = getStars(score.correct, score.total);
    if (stars === 3) setShowConfetti(true);

    if (!user || !node) return;
    const accuracy = score.total > 0 ? score.correct / score.total : 0;

    await supabase.from("skill_tree_progress").upsert(
      {
        user_id: user.id,
        branch: node.branch,
        skill_name: node.id,
        xp: node.xpReward * stars,
        mastered: stars >= 3,
        attempts: 1, // will be incremented via trigger or manual logic
        best_accuracy: accuracy,
      },
      { onConflict: "user_id,branch,skill_name" }
    );

    await supabase.from("training_sessions").insert({
      user_id: user.id,
      pillar: "campaigns",
      session_type: `drill-${node.id}`,
      xp_earned: node.xpReward * stars,
      accuracy,
      positions_attempted: score.total,
      positions_correct: score.correct,
    });

    queryClient.invalidateQueries({ queryKey: ["campaign-progress"] });
  }, [user, node, score]);

  if (!node || puzzles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No puzzles available for this node yet.</p>
          <Button variant="outline" onClick={() => navigate("/campaigns")}>Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  if (finished) {
    const stars = getStars(score.correct, score.total);
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md px-4">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map((s) => (
              <Star key={s} className={`w-10 h-10 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`} />
            ))}
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">{node.name} Complete</h1>
          <p className="text-muted-foreground mb-2">{score.correct}/{score.total} correct · {accuracy}%</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-foreground">+{node.xpReward * stars} XP</span>
          </div>
          {stars < 3 && <p className="text-sm text-muted-foreground mb-6">Get 80%+ for 3 stars and mastery!</p>}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setFinished(false); setCurrentIndex(0); setScore({ correct: 0, total: 0 }); }}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate("/campaigns")}>
              Back to Campaigns
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/campaigns")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{node.name}</h2>
              <p className="text-xs text-muted-foreground">Puzzle {currentIndex + 1} of {puzzles.length}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Score: {score.correct}/{score.total}</div>
        </div>

        <Progress value={((currentIndex + (feedback ? 1 : 0)) / puzzles.length) * 100} className="h-2 mb-6" />

        {current && (
          <div className="flex gap-6 justify-center">
            <div className="w-full max-w-[480px]">
              <Chessboard
                fen={displayFen ?? current.fen}
                onMove={handleMove}
                moveHints={moveHints}
                disabled={!!feedback}
                flipped={playerColor === "b"}
                playerColor={playerColor}
                arrowFrom={bestMoveArrow.from}
                arrowTo={bestMoveArrow.to}
              />

              {/* Hint */}
              {!feedback && current.hint && (
                <p className="mt-3 text-center text-sm text-muted-foreground italic">{current.hint}</p>
              )}

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 p-4 rounded-xl text-center ${
                      feedback === "correct"
                        ? "bg-emerald-500/15 border border-emerald-500/30"
                        : "bg-red-500/15 border border-red-500/30"
                    }`}
                  >
                    <p className={`font-semibold ${feedback === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                      {feedback === "correct" ? "Correct! ✓" : "Incorrect"}
                    </p>
                    {feedback === "wrong" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Best move was <span className="font-mono font-bold text-foreground">{current.solutionSan}</span>
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" onClick={advance}>
                      Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
