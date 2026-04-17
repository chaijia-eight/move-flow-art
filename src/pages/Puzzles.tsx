import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, Trophy, TrendingUp, TrendingDown, Target, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Chessboard from "@/components/Chessboard";
import {
  fetchLichessPuzzle,
  offsetToDifficulty,
  normalizeSan,
  type LichessPuzzle,
} from "@/lib/lichessPuzzle";

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
  const qc = useQueryClient();

  const [offset, setOffset] = useState<number>(0);
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [currentFen, setCurrentFen] = useState<string>("");
  const [moveIndex, setMoveIndex] = useState<number>(0); // Index into solutionSan
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    delta: number;
    expected: string;
  } | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const failedRef = useRef(false); // Track failure across multi-move puzzle

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
    setLoadingNext(true);
    setFeedback(null);
    setPuzzle(null);
    setError(null);
    setMoveIndex(0);
    failedRef.current = false;

    try {
      const p = await fetchLichessPuzzle(offsetToDifficulty(offset));
      setPuzzle(p);
      setCurrentFen(p.startFen);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load puzzle");
    } finally {
      setLoadingNext(false);
    }
  };

  // Auto-load on mount and when offset changes
  useEffect(() => {
    if (profile && !puzzle && !feedback && !loadingNext) {
      loadNextPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, offset]);

  const playerColor = useMemo<"w" | "b">(() => {
    return puzzle?.sideToMove ?? "w";
  }, [puzzle]);

  const finalizeAttempt = async (passed: boolean) => {
    if (!puzzle || !user || !profile) return;
    const ratingBefore = profile.puzzle_rating;
    const delta = computeRatingChange(ratingBefore, puzzle.rating, passed);
    const ratingAfter = Math.max(400, ratingBefore + delta);

    setFeedback({
      correct: passed,
      delta,
      expected: puzzle.solutionSan[moveIndex] ?? "",
    });

    await Promise.all([
      supabase.from("puzzle_attempts").insert({
        user_id: user.id,
        position_id: null,
        fen: puzzle.startFen,
        best_san: puzzle.solutionSan.join(" "),
        played_san: passed ? puzzle.solutionSan.join(" ") : null,
        passed,
        rating_before: ratingBefore,
        rating_after: ratingAfter,
        rating_delta: delta,
        puzzle_rating: puzzle.rating,
      }),
      supabase
        .from("user_profiles")
        .update({
          puzzle_rating: ratingAfter,
          puzzle_wins: profile.puzzle_wins + (passed ? 1 : 0),
          puzzle_losses: profile.puzzle_losses + (passed ? 0 : 1),
        })
        .eq("user_id", user.id),
    ]);

    qc.invalidateQueries({ queryKey: ["puzzle-recent", user.id] });
    refetchProfile();
  };

  const handleMove = async (_from: string, _to: string, san: string) => {
    if (!puzzle || feedback) return;

    const expected = puzzle.solutionSan[moveIndex];
    if (!expected) return;

    if (normalizeSan(san) !== normalizeSan(expected)) {
      failedRef.current = true;
      await finalizeAttempt(false);
      return;
    }

    // Correct move — advance the position with the user's move.
    const chess = new Chess(currentFen);
    chess.move(expected);
    let nextFen = chess.fen();
    let nextIndex = moveIndex + 1;

    // If the puzzle is finished after the user's move, we passed.
    if (nextIndex >= puzzle.solutionSan.length) {
      setCurrentFen(nextFen);
      setMoveIndex(nextIndex);
      await finalizeAttempt(true);
      return;
    }

    // Otherwise, auto-play the opponent's reply (next solution move).
    const opponentReply = puzzle.solutionSan[nextIndex];
    chess.move(opponentReply);
    nextFen = chess.fen();
    nextIndex += 1;

    setCurrentFen(nextFen);
    setMoveIndex(nextIndex);

    // After the opponent's reply, if the puzzle is done, we passed.
    if (nextIndex >= puzzle.solutionSan.length) {
      await finalizeAttempt(true);
    }
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
  const movesRemaining = puzzle
    ? Math.max(0, Math.ceil((puzzle.solutionSan.length - moveIndex) / 2))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Puzzles</h1>
              <p className="text-xs text-muted-foreground">Powered by Lichess · multi-move</p>
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
              (relative to your rating ≈ {targetRating})
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
            {puzzle ? (
              <>
                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="text-muted-foreground">
                    {playerColor === "w" ? "White" : "Black"} to move ·{" "}
                    <span className="font-mono text-foreground">{puzzle.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {movesRemaining > 0 && !feedback && (
                      <>~{movesRemaining} move{movesRemaining > 1 ? "s" : ""} left</>
                    )}
                  </div>
                </div>
                <div className="max-w-xl mx-auto">
                  <Chessboard
                    fen={currentFen}
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
                      className={`mt-4 p-4 rounded-lg flex items-center justify-between flex-wrap gap-3 ${
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
                          {!feedback.correct && feedback.expected && (
                            <div className="text-xs text-muted-foreground">
                              Best was <span className="font-mono text-foreground">{feedback.expected}</span>
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
                        <a
                          href={`https://lichess.org/training/${puzzle.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
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
                <h2 className="text-lg font-bold text-foreground mb-2">
                  {error ? "Couldn't load puzzle" : "Ready to train"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {error ?? "Fetch a puzzle from Lichess to begin."}
                </p>
                <Button onClick={loadNextPuzzle}>Load Puzzle</Button>
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
