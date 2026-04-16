import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, ExternalLink, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Chessboard from "@/components/Chessboard";
import EvalBar from "@/components/EvalBar";
import ConfettiBurst from "@/components/ConfettiBurst";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";

type Phase = "ready" | "diagnostic" | "practice" | "complete";

interface DrillPosition {
  id: string;
  fen: string;
  category: string;
  engine_best_san: string | null;
  your_move_san: string | null;
  eval_before: number | null;
  eval_after: number | null;
  difficulty_score: number | null;
}

export default function Forge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showBestMove, setShowBestMove] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [displayFen, setDisplayFen] = useState<string | null>(null);
  const [showBattleChoice, setShowBattleChoice] = useState(false);

  // Fetch profile for streak
  const { data: profile } = useQuery({
    queryKey: ["forge-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("warmup_streak, longest_streak, chesscom_username, lichess_username")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch rapid game IDs first, then undrilled positions from those games only
  const { data: rapidGameIds } = useQuery({
    queryKey: ["forge-rapid-games", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_games")
        .select("id, time_control")
        .eq("user_id", user!.id);
      // Rapid = 10+0 through 30min (600-1800 seconds initial)
      const rapid = (data ?? []).filter((g) => {
        if (!g.time_control) return false;
        const base = parseInt(g.time_control.split(/[+/]/)[0], 10);
        return base >= 600 && base <= 1800;
      });
      return rapid.map((g) => g.id);
    },
  });

  const { data: positions } = useQuery({
    queryKey: ["forge-positions", user?.id, rapidGameIds],
    enabled: !!user && !!rapidGameIds && rapidGameIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("drilled", false)
        .in("game_id", rapidGameIds!)
        .gte("difficulty_score", 4)
        .order("difficulty_score", { ascending: false })
        .limit(20);
      // Strict filter: only big swings
      // 1. Missed opportunity: eval_before was roughly equal/slightly worse, best move would give big advantage
      // 2. Blew a good position: eval_before was good for player, eval_after is bad
      const filtered = (data ?? []).filter((p) => {
        const before = p.eval_before ?? 0;
        const after = p.eval_after ?? 0;
        const cpLoss = Math.abs(before - after);
        // Position went from decent (>= -1.0) to bad (<= -2.0) — blew it
        const blewIt = before >= -100 && after <= -200;
        // Had a big missed opportunity: best move gains 2+ pawns but player didn't find it
        const missedBig = cpLoss >= 200;
        return blewIt || missedBig;
      });
      return filtered.slice(0, 8) as DrillPosition[];
    },
  });

  // Check today's warmup
  const { data: todayWarmup } = useQuery({
    queryKey: ["forge-today-warmup", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("warmup_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("warmup_date", today)
        .maybeSingle();
      return data;
    },
  });

  const diagnosticPositions = useMemo(() => (positions ?? []).slice(0, 3), [positions]);
  const practicePositions = useMemo(() => (positions ?? []).slice(3, 8), [positions]);
  const allPositions = useMemo(
    () => (phase === "diagnostic" ? diagnosticPositions : practicePositions),
    [phase, diagnosticPositions, practicePositions]
  );
  const current = allPositions[currentIndex] ?? null;
  const totalPuzzles = diagnosticPositions.length + practicePositions.length;
  const globalIndex =
    phase === "diagnostic"
      ? currentIndex
      : diagnosticPositions.length + currentIndex;

  const isConnected = !!(profile?.chesscom_username || profile?.lichess_username);
  const hasBothPlatforms = !!(profile?.chesscom_username && profile?.lichess_username);
  const streak = profile?.warmup_streak ?? 0;
  const weaknessCategory = diagnosticPositions[0]?.category ?? "blunder";
  const noPositionsLeft = !!positions && positions.length === 0;

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Build move hints for current position
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

  // Best move arrow for wrong answers
  const bestMoveArrow = useMemo(() => {
    if (!current?.engine_best_san || !showBestMove) return { from: undefined, to: undefined };
    try {
      const chess = new Chess(current.fen);
      const move = chess.move(current.engine_best_san);
      if (move) return { from: move.from, to: move.to };
    } catch {}
    return { from: undefined, to: undefined };
  }, [current, showBestMove]);

  // Eval for bar
  const evalScore = useMemo(() => {
    if (!current) return 0;
    return current.eval_before ?? 0;
  }, [current]);

  const handleMove = useCallback(
    (_from: string, _to: string, san: string) => {
      if (!current || feedback) return;
      const bestSan = current.engine_best_san?.replace(/[+#]/g, "") ?? "";
      const playerSan = san.replace(/[+#]/g, "");
      const isCorrect = playerSan === bestSan;

      setScore((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        // Show the position after the correct move
        try {
          const chess = new Chess(current.fen);
          chess.move(san);
          setDisplayFen(chess.fen());
        } catch {
          // fallback — keep current fen
        }
      } else {
        setShowBestMove(true);
      }

      // Mark as drilled
      supabase
        .from("user_positions")
        .update({ drilled: true })
        .eq("id", current.id)
        .then();
    },
    [current, feedback]
  );

  const advance = useCallback(() => {
    setFeedback(null);
    setShowBestMove(false);
    setDisplayFen(null);
    const next = currentIndex + 1;
    if (next >= allPositions.length) {
      if (phase === "diagnostic" && practicePositions.length > 0) {
        setPhase("practice");
        setCurrentIndex(0);
      } else {
        completeWarmup();
      }
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, allPositions, phase, practicePositions]);

  const completeWarmup = useCallback(async () => {
    setTimerActive(false);
    setPhase("complete");
    setShowConfetti(true);

    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    // Save warmup session
    await supabase.from("warmup_sessions").upsert(
      {
        user_id: user.id,
        weakness_category: weaknessCategory,
        diagnostic_correct: Math.min(score.correct, diagnosticPositions.length),
        diagnostic_total: diagnosticPositions.length,
        practice_correct: Math.max(0, score.correct - diagnosticPositions.length),
        practice_total: practicePositions.length,
        warmup_date: today,
      },
      { onConflict: "user_id,warmup_date" }
    );

    // Save training session
    await supabase.from("training_sessions").insert({
      user_id: user.id,
      pillar: "forge",
      session_type: "warmup",
      xp_earned: score.correct * 10,
      accuracy: score.total > 0 ? score.correct / score.total : 0,
      positions_attempted: score.total,
      positions_correct: score.correct,
      duration_seconds: timer,
    });

    // Update streak
    const newStreak = (profile?.warmup_streak ?? 0) + 1;
    const longest = Math.max(newStreak, profile?.longest_streak ?? 0);
    await supabase
      .from("user_profiles")
      .update({
        warmup_streak: newStreak,
        longest_streak: longest,
      })
      .eq("user_id", user.id);

    queryClient.invalidateQueries({ queryKey: ["forge-profile"] });
    queryClient.invalidateQueries({ queryKey: ["forge-today-warmup"] });
    queryClient.invalidateQueries({ queryKey: ["forge-positions"] });
  }, [user, score, timer, weaknessCategory, diagnosticPositions, practicePositions, profile]);

  const startWarmup = () => {
    setPhase("diagnostic");
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setTimer(0);
    setTimerActive(true);
    setFeedback(null);
    setShowBestMove(false);
  };

  const goBattle = (platform?: "chesscom" | "lichess") => {
    if (hasBothPlatforms && !platform) {
      setShowBattleChoice(true);
      return;
    }
    const target = platform ?? (profile?.chesscom_username ? "chesscom" : "lichess");
    if (target === "chesscom") {
      window.open("https://www.chess.com/play/online", "_blank");
    } else {
      window.open("https://lichess.org/", "_blank");
    }
    setShowBattleChoice(false);
  };

  // Determine player color from FEN
  const playerColor = useMemo(() => {
    if (!current) return "w" as const;
    return current.fen.includes(" b ") ? "b" as const : "w" as const;
  }, [current]);

  // ===================== RENDER =====================

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Flame className="w-16 h-16 mx-auto mb-4 text-orange-500/40" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">The Forge</h1>
          <p className="text-muted-foreground mb-6">
            Connect your Chess.com or Lichess account to start your daily warmup.
          </p>
          <Button onClick={() => navigate("/connect")} className="gap-2">
            Connect Account <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Already done today
  if (todayWarmup && phase === "ready") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              You're Forged
            </h1>
            <p className="text-muted-foreground mb-2">
              {streak} day streak 🔥
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You've already warmed up today. Go play some rated games!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => goBattle()} className="gap-2 bg-orange-600 hover:bg-orange-700">
                Go Battle <ExternalLink className="w-4 h-4" />
              </Button>
              {showBattleChoice && (
                <div className="flex gap-2 w-full justify-center">
                  <Button variant="outline" size="sm" onClick={() => goBattle("chesscom")}>Chess.com</Button>
                  <Button variant="outline" size="sm" onClick={() => goBattle("lichess")}>Lichess</Button>
                </div>
              )}
              {!noPositionsLeft && (
                <Button variant="outline" onClick={startWarmup}>
                  Train Again
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // No positions available
  if (phase === "ready" && positions && positions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Flame className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">No Mistakes Found</h1>
          <p className="text-muted-foreground mb-6">
            We haven't found any critical mistakes to drill. Sync more games or analyze your existing ones from the Stats page.
          </p>
          <Button variant="outline" onClick={() => navigate("/stats")} className="gap-2">
            Go to Stats <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Ready state
  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Flame className="w-20 h-20 mx-auto mb-4 text-orange-500 drop-shadow-[0_0_24px_rgba(249,115,22,0.4)]" />
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Ready to Sharpen Your Edge?
            </h1>
            {streak > 0 && (
              <p className="text-orange-500 font-semibold mb-2">
                🔥 {streak} day streak
              </p>
            )}
            <p className="text-muted-foreground mb-8">
              {totalPuzzles} puzzles based on your recent mistakes. ~5 minutes.
            </p>
            <Button
              size="lg"
              onClick={startWarmup}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6"
            >
              <Flame className="w-5 h-5" /> Start Warmup
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Complete state
  if (phase === "complete") {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <Flame className="w-20 h-20 mx-auto mb-4 text-orange-500 drop-shadow-[0_0_32px_rgba(249,115,22,0.5)]" />
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              You're Forged 🔥
            </h1>
            <p className="text-muted-foreground mb-6">
              {score.correct}/{score.total} correct · {accuracy}% accuracy · {formatTime(timer)}
            </p>
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Button
                  size="lg"
                  onClick={() => goBattle()}
                  className="gap-2 bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6"
                >
                  Go Battle <ExternalLink className="w-5 h-5" />
                </Button>
              </motion.div>
              {showBattleChoice && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => goBattle("chesscom")}>Chess.com</Button>
                  <Button variant="outline" onClick={() => goBattle("lichess")}>Lichess</Button>
                </div>
              )}
              <Button variant="outline" size="lg" onClick={() => navigate("/")}>
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Drill state (diagnostic or practice)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {phase === "diagnostic" ? "Diagnostic" : "Practice"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Puzzle {globalIndex + 1} of {totalPuzzles}
              </p>
            </div>
          </div>
          <div className="text-sm font-mono text-muted-foreground">{formatTime(timer)}</div>
        </div>

        {/* Progress bar */}
        <Progress
          value={((globalIndex + (feedback ? 1 : 0)) / totalPuzzles) * 100}
          className="h-2 mb-6"
        />

        {current && (
          <div className="flex gap-6 justify-center">
            {/* Eval bar */}
            <div className="hidden sm:block">
              <EvalBar evalBefore={current?.eval_before ?? null} evalAfter={current?.eval_after ?? null} flipped={playerColor === "b"} />
            </div>

            {/* Board */}
            <div className="w-full max-w-[480px]">
              <Chessboard
                fen={current.fen}
                onMove={handleMove}
                moveHints={moveHints}
                disabled={!!feedback}
                flipped={playerColor === "b"}
                playerColor={playerColor}
                arrowFrom={bestMoveArrow.from}
                arrowTo={bestMoveArrow.to}
              />

              {/* Feedback */}
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
                    <p className={`font-semibold ${
                      feedback === "correct" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {feedback === "correct" ? "Correct! ✓" : "Incorrect"}
                    </p>
                    {feedback === "wrong" && current.engine_best_san && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Best move was <span className="font-mono font-bold text-foreground">{current.engine_best_san}</span>
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => advance()}
                    >
                      Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Score */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Score: {score.correct}/{score.total}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
