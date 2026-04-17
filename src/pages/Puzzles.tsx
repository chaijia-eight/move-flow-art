import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, ChevronRight, Flame, RotateCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Chessboard from "@/components/Chessboard";

const PUZZLE_COUNT = 5;

interface Puzzle {
  id: string;
  fen: string;
  best_san: string;
  category: string;
}

export default function Puzzles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const { data: rawPuzzles, isLoading, refetch } = useQuery({
    queryKey: ["daily-puzzles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("id, fen, engine_best_san, category")
        .eq("user_id", user!.id)
        .not("engine_best_san", "is", null)
        .order("difficulty_score", { ascending: false })
        .limit(50);
      const list = (data || [])
        .filter((p: any) => p.engine_best_san)
        .map((p: any) => ({
          id: p.id,
          fen: p.fen,
          best_san: p.engine_best_san,
          category: p.category,
        })) as Puzzle[];
      // Shuffle then take N
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list.slice(0, PUZZLE_COUNT);
    },
  });

  const puzzles = rawPuzzles ?? [];
  const current = puzzles[idx];

  const playerColor = useMemo<"w" | "b">(() => {
    if (!current) return "w";
    return current.fen.split(" ")[1] === "w" ? "w" : "b";
  }, [current]);

  useEffect(() => {
    setFeedback(null);
  }, [idx]);

  const handleMove = (_from: string, _to: string, san: string) => {
    if (!current || feedback) return;
    const normalize = (s: string) => s.replace(/[+#]/g, "");
    const correct = normalize(san) === normalize(current.best_san);
    setFeedback(correct ? "correct" : "wrong");
    setResults((prev) => [...prev, correct]);
    setTimeout(() => {
      if (idx + 1 >= puzzles.length) {
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 1400);
  };

  const reset = () => {
    setIdx(0);
    setResults([]);
    setFeedback(null);
    setDone(false);
    refetch();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading puzzles...</div>;
  }

  if (!puzzles.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Brain className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No puzzles available</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Puzzles are generated from positions in your own games. Sync and analyze games first.
          </p>
          <Button onClick={() => navigate("/connect")}>Connect Account</Button>
        </div>
      </div>
    );
  }

  if (done) {
    const correctCount = results.filter(Boolean).length;
    const perfect = correctCount === puzzles.length;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-2xl border border-border bg-card text-center"
        >
          {perfect ? (
            <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          ) : (
            <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {correctCount} / {puzzles.length} solved
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {perfect ? "Perfect run! Come back tomorrow." : "Nice work. Try another set?"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              <RotateCw className="w-4 h-4 mr-1.5" /> New Set
            </Button>
            <Button onClick={() => navigate("/")}>Done</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Daily Puzzles
            </h1>
            <p className="text-xs text-muted-foreground">From your own games</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {idx + 1} / {puzzles.length}
          </div>
        </div>

        <Progress value={((idx) / puzzles.length) * 100} className="h-1.5 mb-6" />

        <div className="text-center mb-3 text-sm text-muted-foreground">
          {playerColor === "w" ? "White" : "Black"} to move — find the best move
        </div>

        <div className="max-w-xl mx-auto">
          <Chessboard
            fen={current.fen}
            onMove={handleMove}
            moveHints={new Map()}
            disabled={!!feedback}
            flipped={playerColor === "b"}
            playerColor={playerColor}
          />
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3 rounded-lg text-center font-medium ${
                feedback === "correct"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {feedback === "correct" ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Correct!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Best was <span className="font-mono">{current.best_san}</span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
