import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, Trophy, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Chessboard from "@/components/Chessboard";

interface Puzzle {
  id: string;
  fen: string;
  best_san: string;
  category: string;
  puzzle_rating: number;
}

interface Profile {
  puzzle_rating: number;
  puzzle_wins: number;
  puzzle_losses: number;
}

const DIFFICULTY_OFFSETS = [
  { label: "Much Easier", value: -300 },
  { label: "Easier", value: -100 },
  { label: "Your Level", value: 0 },
  { label: "Harder", value: +100 },
  { label: "Much Harder", value: +300 },
];

// Map our internal difficulty_score (0+) to a pseudo-rating.
// Heuristic: base 1000 + 50 per difficulty point, capped.
function deriveRating(difficultyScore: number | null | undefined): number {
  const d = difficultyScore ?? 0;
  return Math.max(600, Math.min(2400, 1000 + d * 40));
}

// Glicko-lite: simple Elo-style rating change.
function computeRatingChange(
  playerRating: number,
  puzzleRating: number,
  won: boolean,
): number {
  const expected = 1 / (1 + Math.pow(10, (puzzleRating - playerRating) / 400));
  const score = won ? 1 : 0;
  const K = 24;
  return Math.round(K * (score - expected));
}

export default function Puzzles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [offset, setOffset] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    delta: number;
    best: string;
  } | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  // Profile + rating
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["puzzle-profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile> => {
      const { data } = await supabase
        .from("user_profiles")
        .select("puzzle_rating, puzzle_wins, puzzle_losses")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!data) {
        await supabase.from("user_profiles").insert({
          user_id: user!.id,
          puzzle_rating: 1200,
        });
        return { puzzle_rating: 1200, puzzle_wins: 0, puzzle_losses: 0 };
      }
      return data as Profile;
    },
  });

  // Recent attempts for history strip
  const { data: recent } = useQuery({
    queryKey: ["puzzle-recent", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("puzzle_attempts")
        .select("id, passed, rating_delta, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const targetRating = (profile?.puzzle_rating ?? 1200) + offset;

  const loadNextPuzzle = async () => {
    if (!user) return;
    setLoadingNext(true);
    setFeedback(null);
    setCurrentPuzzle(null);

    // Fetch a window of puzzles, then pick the one closest to target.
    const { data } = await supabase
      .from("user_positions")
      .select("id, fen, engine_best_san, category, difficulty_score")
      .eq("user_id", user.id)
      .not("engine_best_san", "is", null)
      .limit(200);

    const list = (data ?? []).filter((p: any) => p.engine_best_san);
    if (!list.length) {
      setLoadingNext(false);
      return;
    }

    // Sort by closeness to target rating, then take random from top 8 to add variety.
    const scored = list
      .map((p: any) => ({
        ...p,
        puzzle_rating: deriveRating(p.difficulty_score),
      }))
      .sort(
        (a, b) =>
          Math.abs(a.puzzle_rating - targetRating) -
          Math.abs(b.puzzle_rating - targetRating),
      );
    const pool = scored.slice(0, Math.min(8, scored.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];

    setCurrentPuzzle({
      id: pick.id,
      fen: pick.fen,
      best_san: pick.engine_best_san,
      category: pick.category,
      puzzle_rating: pick.puzzle_rating,
    });
    setLoadingNext(false);
  };

  // Auto-load first puzzle when profile is ready or offset changes
  useEffect(() => {
    if (profile && !currentPuzzle && !feedback) {
      loadNextPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, offset]);

  const playerColor = useMemo<"w" | "b">(() => {
    if (!currentPuzzle) return "w";
    return currentPuzzle.fen.split(" ")[1] === "w" ? "w" : "b";
  }, [currentPuzzle]);

  const handleMove = async (_from: string, _to: string, san: string) => {
    if (!currentPuzzle || feedback || !user || !profile) return;
    const normalize = (s: string) => s.replace(/[+#]/g, "");
    const correct = normalize(san) === normalize(currentPuzzle.best_san);

    const ratingBefore = profile.puzzle_rating;
    const delta = computeRatingChange(
      ratingBefore,
      currentPuzzle.puzzle_rating,
      correct,
    );
    const ratingAfter = Math.max(400, ratingBefore + delta);

    setFeedback({ correct, delta, best: currentPuzzle.best_san });

    // Persist attempt + updated profile counters
    await Promise.all([
      supabase.from("puzzle_attempts").insert({
        user_id: user.id,
        position_id: currentPuzzle.id,
        fen: currentPuzzle.fen,
        best_san: currentPuzzle.best_san,
        played_san: san,
        passed: correct,
        rating_before: ratingBefore,
        rating_after: ratingAfter,
        rating_delta: delta,
        puzzle_rating: currentPuzzle.puzzle_rating,
      }),
      supabase
        .from("user_profiles")
        .update({
          puzzle_rating: ratingAfter,
          puzzle_wins: profile.puzzle_wins + (correct ? 1 : 0),
          puzzle_losses: profile.puzzle_losses + (correct ? 0 : 1),
        })
        .eq("user_id", user.id),
    ]);

    qc.invalidateQueries({ queryKey: ["puzzle-recent", user.id] });
    refetchProfile();
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const totalAttempts = profile.puzzle_wins + profile.puzzle_losses;
  const winRate = totalAttempts ? Math.round((profile.puzzle_wins / totalAttempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header: rating + stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Puzzles</h1>
              <p className="text-xs text-muted-foreground">From your own games</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                {profile.puzzle_rating}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</div>
            </div>
            <div className="text-center px-3 border-l border-border">
              <div className="text-lg font-semibold text-emerald-500">{profile.puzzle_wins}W</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Wins</div>
            </div>
            <div className="text-center px-3 border-l border-border">
              <div className="text-lg font-semibold text-red-400">{profile.puzzle_losses}L</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Losses</div>
            </div>
            <div className="text-center px-3 border-l border-border">
              <div className="text-lg font-semibold text-foreground">{winRate}%</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Difficulty</span>
            <span className="text-xs text-muted-foreground ml-1">
              (target ≈ {targetRating})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OFFSETS.map((d) => {
              const active = offset === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setOffset(d.value)}
                  disabled={!!feedback || loadingNext}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {d.label}
                  <span className="ml-1.5 opacity-70">
                    {d.value > 0 ? `+${d.value}` : d.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          {/* Board */}
          <div>
            {currentPuzzle ? (
              <>
                <div className="text-center mb-3 text-sm text-muted-foreground">
                  {playerColor === "w" ? "White" : "Black"} to move · Puzzle rating{" "}
                  <span className="font-mono text-foreground">{currentPuzzle.puzzle_rating}</span>
                </div>
                <div className="max-w-xl mx-auto">
                  <Chessboard
                    fen={currentPuzzle.fen}
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
                      className={`mt-4 p-4 rounded-lg flex items-center justify-between ${
                        feedback.correct
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {feedback.correct ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <div className={`font-semibold ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
                            {feedback.correct ? "Solved!" : "Wrong move"}
                          </div>
                          {!feedback.correct && (
                            <div className="text-xs text-muted-foreground">
                              Best was <span className="font-mono text-foreground">{feedback.best}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 font-bold ${
                          feedback.delta >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {feedback.delta >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {feedback.delta >= 0 ? `+${feedback.delta}` : feedback.delta}
                        </div>
                        <Button size="sm" onClick={loadNextPuzzle} disabled={loadingNext}>
                          Next →
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : loadingNext ? (
              <div className="aspect-square max-w-xl mx-auto flex items-center justify-center text-muted-foreground">
                Loading puzzle...
              </div>
            ) : (
              <div className="aspect-square max-w-xl mx-auto flex flex-col items-center justify-center text-center p-8 border border-border rounded-2xl bg-card">
                <Brain className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <h2 className="text-lg font-bold text-foreground mb-2">No puzzles in range</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sync more games or change difficulty.
                </p>
                <Button onClick={() => navigate("/connect")}>Connect Account</Button>
              </div>
            )}
          </div>

          {/* Sidebar: recent history */}
          <aside className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Recent
            </div>
            <div className="space-y-1.5">
              {(recent ?? []).length === 0 && (
                <div className="text-xs text-muted-foreground italic">No attempts yet</div>
              )}
              {(recent ?? []).map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    {r.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-muted-foreground">
                      {r.passed ? "Solved" : "Failed"}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-semibold ${
                      r.rating_delta >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {r.rating_delta >= 0 ? `+${r.rating_delta}` : r.rating_delta}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
