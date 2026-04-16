import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerCharacter } from "@/hooks/usePlayerCharacter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Chessboard from "@/components/Chessboard";
import ConfettiBurst from "@/components/ConfettiBurst";
import { Chess } from "chess.js";
import { generateDailyQuests, XP_REWARDS, EMBER_REWARDS } from "@/data/rpgData";
import type { MoveCategory } from "@/data/openings";

interface DrillPosition {
  id: string;
  fen: string;
  category: string;
  engine_best_san: string | null;
}

export default function DailyRitual() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { character, addXpAndEmbers, updateStreak } = usePlayerCharacter();

  const [phase, setPhase] = useState<"ready" | "fighting" | "complete">("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayFen, setDisplayFen] = useState<string | null>(null);
  const [showBattleChoice, setShowBattleChoice] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["ritual-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: positions } = useQuery({
    queryKey: ["ritual-positions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get rapid games
      const { data: games } = await supabase
        .from("user_games")
        .select("id")
        .eq("user_id", user!.id)
        .ilike("time_control", "%rapid%");
      if (!games?.length) return [];
      const gameIds = games.map((g) => g.id);
      const { data: pos } = await supabase
        .from("user_positions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("drilled", false)
        .in("game_id", gameIds)
        .not("engine_best_san", "is", null)
        .order("difficulty_score", { ascending: false })
        .limit(8);
      return (pos || []) as DrillPosition[];
    },
  });

  const { data: todayRitual } = useQuery({
    queryKey: ["today-ritual-page", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_rituals" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("ritual_date", today)
        .maybeSingle();
      return data as any;
    },
  });

  const isConnected = !!(profile?.chesscom_username || profile?.lichess_username);
  const alreadyDone = !!todayRitual?.bonus_claimed;
  const drillPositions = positions || [];
  const current = drillPositions[currentIndex];

  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!current) return hints;
    try {
      const game = new Chess(current.fen);
      const moves = game.moves({ verbose: true });
      for (const m of moves) {
        if (!hints.has(m.from)) hints.set(m.from, { category: "main" as MoveCategory, targets: new Map() });
        hints.get(m.from)!.targets.set(m.to, "main" as MoveCategory);
      }
    } catch {}
    return hints;
  }, [current]);

  const bestMoveArrow = useMemo(() => {
    if (!current?.engine_best_san || feedback !== "wrong") return undefined;
    try {
      const game = new Chess(current.fen);
      const move = game.move(current.engine_best_san);
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
      const cleanBest = (current.engine_best_san || "").replace(/[+#]/g, "");
      const isCorrect = cleanSan === cleanBest;

      setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        try {
          const game = new Chess(current.fen);
          game.move(current.engine_best_san!);
          setDisplayFen(game.fen());
        } catch {}
      }

      // Mark drilled
      supabase.from("user_positions").update({ drilled: true }).eq("id", current.id).then();
    },
    [current, feedback]
  );

  const advance = useCallback(() => {
    setFeedback(null);
    setDisplayFen(null);
    if (currentIndex + 1 >= drillPositions.length) {
      completeRitual();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, drillPositions.length]);

  const completeRitual = async () => {
    setPhase("complete");
    setShowConfetti(true);

    const xp = XP_REWARDS.dailyRitualQuest * 3 + XP_REWARDS.dailyRitualBonus;
    const embers = EMBER_REWARDS.dailyRitualQuest * 3 + EMBER_REWARDS.dailyRitualBonus;

    try {
      await addXpAndEmbers.mutateAsync({ xp, embers });
      await updateStreak.mutateAsync();

      const today = new Date().toISOString().split("T")[0];
      const quests = generateDailyQuests();
      await supabase.from("daily_rituals" as any).upsert({
        user_id: user!.id,
        ritual_date: today,
        quest_1_type: quests[0]?.id || "speed_trial",
        quest_1_completed: true,
        quest_2_type: quests[1]?.id || "fork_hunt",
        quest_2_completed: true,
        quest_3_type: quests[2]?.id || "mate_patterns",
        quest_3_completed: true,
        bonus_claimed: true,
        xp_earned: xp,
        embers_earned: embers,
      } as any, { onConflict: "user_id,ritual_date" } as any);

      queryClient.invalidateQueries({ queryKey: ["today-ritual"] });
      queryClient.invalidateQueries({ queryKey: ["player-character"] });
    } catch (e) {
      console.error("Failed to save ritual:", e);
    }
  };

  const goBattle = (platform: "chesscom" | "lichess") => {
    const url = platform === "chesscom"
      ? "https://www.chess.com/play/online"
      : "https://lichess.org";
    window.open(url, "_blank");
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <Flame className="w-12 h-12 text-orange-500" />
        <h2 className="text-xl font-bold text-foreground">The Anvil is Cold</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Link your Chess.com or Lichess account so the forge can read your battles and forge your training.
        </p>
        <Button onClick={() => navigate("/connect")}>Link Account</Button>
      </div>
    );
  }

  // Already done today
  if (alreadyDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <div className="text-5xl">⚒️</div>
        <h2 className="text-xl font-bold text-foreground">Ritual Complete</h2>
        <p className="text-muted-foreground text-center">You've forged your edge today. Return tomorrow.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/")}>Back to Forge</Button>
          <Button onClick={() => setShowBattleChoice(true)}>
            Go Battle <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {showBattleChoice && (
          <div className="flex gap-3 mt-2">
            <Button variant="outline" size="sm" onClick={() => goBattle("chesscom")}>Chess.com</Button>
            <Button variant="outline" size="sm" onClick={() => goBattle("lichess")}>Lichess</Button>
          </div>
        )}
      </div>
    );
  }

  // No positions
  if (drillPositions.length === 0 && phase === "ready") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <Flame className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">No Positions to Forge</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Play some rapid games and sync them. The forge needs raw material.
        </p>
        <Button variant="outline" onClick={() => navigate("/connect")}>Sync Games</Button>
      </div>
    );
  }

  // Complete
  if (phase === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ConfettiBurst trigger={showConfetti} />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're Forged</h2>
          <p className="text-muted-foreground mb-2">{score.correct} / {score.total} strikes landed</p>
          <p className="text-sm text-orange-400 mb-6">
            +{XP_REWARDS.dailyRitualQuest * 3 + XP_REWARDS.dailyRitualBonus} XP · +{EMBER_REWARDS.dailyRitualQuest * 3 + EMBER_REWARDS.dailyRitualBonus} 🔥
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate("/")}>Back to Forge</Button>
            <Button onClick={() => setShowBattleChoice(true)}>
              Go Battle <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {showBattleChoice && (
            <div className="flex gap-3 mt-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => goBattle("chesscom")}>Chess.com</Button>
              <Button variant="outline" size="sm" onClick={() => goBattle("lichess")}>Lichess</Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Ready
  if (phase === "ready") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 px-4">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Flame className="w-16 h-16 text-orange-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">The Anvil Glows</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {drillPositions.length} positions forged from your recent battles. Find the best move in each.
        </p>
        <Button size="lg" onClick={() => setPhase("fighting")} className="bg-orange-500 hover:bg-orange-600 text-white">
          Begin Ritual
        </Button>
      </div>
    );
  }

  // Fighting
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Daily Ritual</p>
            <p className="text-xs text-muted-foreground">Position {currentIndex + 1} of {drillPositions.length}</p>
          </div>
          <span className="text-sm font-bold text-foreground">{score.correct}/{score.total}</span>
        </div>

        <Progress value={((currentIndex + 1) / drillPositions.length) * 100} className="h-1.5 mb-4" />

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

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl text-center ${
                feedback === "correct"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <p className={`font-bold ${feedback === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                {feedback === "correct" ? "⚔️ Strike!" : "💀 Missed"}
              </p>
              {feedback === "wrong" && current.engine_best_san && (
                <p className="text-sm text-muted-foreground mt-1">
                  Best was <span className="text-foreground font-mono">{current.engine_best_san}</span>
                </p>
              )}
              <Button size="sm" className="mt-3" onClick={advance}>
                {currentIndex + 1 >= drillPositions.length ? "Finish" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
