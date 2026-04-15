import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SkipForward, RotateCcw, Trophy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Chessboard from "@/components/Chessboard";
import EvalBar from "@/components/EvalBar";
import { Chess } from "chess.js";
import { playMoveSound, playCaptureSound, playCheckSound } from "@/lib/chessSounds";
import type { MoveCategory } from "@/data/openings";

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
  game_id: string | null;
}

interface GameMeta {
  opponent: string | null;
  platform: string;
  time_control: string | null;
  result: string | null;
  played_at: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  blunder: "Blunders",
  missed_tactic: "Missed Tactics",
  defensive_crux: "Defensive Drills",
  endgame_tech: "Endgame Technique",
};

function lichessAnalysisUrl(fen: string) {
  return `https://lichess.org/analysis/${fen.replace(/ /g, "_")}`;
}

function chesscomAnalysisUrl(fen: string) {
  return `https://www.chess.com/analysis?fen=${encodeURIComponent(fen)}`;
}

export default function PositionDrill() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [positions, setPositions] = useState<DrillPosition[]>([]);
  const [gameMetas, setGameMetas] = useState<Record<string, GameMeta>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [boardFen, setBoardFen] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !category) return;
    (async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", category)
        .eq("drilled", false)
        .gte("difficulty_score", 4) // Only big mistakes (≥200cp loss)
        .order("difficulty_score", { ascending: false })
        .limit(20);
      const pos = (data ?? []) as DrillPosition[];
      setPositions(pos);

      // Fetch game metadata for all positions
      const gameIds = [...new Set(pos.map((p) => p.game_id).filter(Boolean))] as string[];
      if (gameIds.length > 0) {
        const { data: games } = await supabase
          .from("user_games")
          .select("id, opponent, platform, time_control, result, played_at")
          .in("id", gameIds);
        if (games) {
          const map: Record<string, GameMeta> = {};
          for (const g of games) {
            map[g.id] = { opponent: g.opponent, platform: g.platform, time_control: g.time_control, result: g.result, played_at: g.played_at };
          }
          setGameMetas(map);
        }
      }
      setLoading(false);
    })();
  }, [user, category]);

  const current = positions[currentIndex];
  const currentGame = current?.game_id ? gameMetas[current.game_id] : null;

  const advance = useCallback(() => {
    if (currentIndex + 1 >= positions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
      setPlayerMove(null);
      setBoardFen(null);
    }
  }, [currentIndex, positions.length]);

  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!current || feedback) return hints;
    try {
      const chess = new Chess(current.fen);
      const moves = chess.moves({ verbose: true });
      for (const m of moves) {
        if (!hints.has(m.from)) {
          hints.set(m.from, { category: "main_line" as MoveCategory, targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main_line" as MoveCategory);
      }
    } catch { /* ignore */ }
    return hints;
  }, [current, feedback]);

  // Compute best move arrow for wrong answers
  const bestMoveArrow = useMemo(() => {
    if (!current || feedback !== "wrong" || !current.engine_best_san) return null;
    try {
      const chess = new Chess(current.fen);
      const move = chess.move(current.engine_best_san);
      if (move) return { from: move.from, to: move.to };
    } catch { /* ignore */ }
    return null;
  }, [current, feedback]);

  const handleMove = useCallback((_from: string, _to: string, san: string) => {
    if (!current || feedback) return;

    // Play move sound and update board
    try {
      const chess = new Chess(current.fen);
      const result = chess.move(san);
      if (result) {
        setBoardFen(chess.fen());
        if (chess.isCheck()) {
          playCheckSound();
        } else if (result.captured) {
          playCaptureSound();
        } else {
          playMoveSound();
        }
      }
    } catch {
      playMoveSound();
    }

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
    setBoardFen(null);
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

        {/* Game info bar */}
        {currentGame && (
          <div className="flex items-center justify-center gap-3 mb-3 text-xs text-muted-foreground">
            <span className="capitalize">{currentGame.platform}</span>
            {currentGame.opponent && (
              <span>vs <span className="text-foreground font-medium">{currentGame.opponent}</span></span>
            )}
            {currentGame.time_control && <span>· {currentGame.time_control}</span>}
            {currentGame.result && <span>· {currentGame.result}</span>}
          </div>
        )}

        {/* Prompt */}
        <p className="text-sm text-muted-foreground mb-2 text-center">
          Move {current.move_number} · {turnFromFen === "w" ? "White" : "Black"} to move — find the best move!
        </p>

        {/* Board + Eval Bar */}
        <div className="flex justify-center items-stretch gap-2 mb-4">
          <div className="max-w-[400px] w-full">
            <Chessboard
              fen={boardFen || current.fen}
              flipped={turnFromFen === "b"}
              onMove={handleMove}
              moveHints={moveHints}
              disabled={!!feedback}
              playerColor={turnFromFen as "w" | "b"}
              arrowFrom={bestMoveArrow?.from}
              arrowTo={bestMoveArrow?.to}
            />
          </div>
          {feedback && (
            <EvalBar
              evalBefore={current.eval_before}
              evalAfter={current.eval_after}
              flipped={turnFromFen === "b"}
            />
          )}
        </div>

        {/* Feedback area — fixed height to prevent layout shift */}
        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center pt-4"
              >
                <Button variant="ghost" onClick={handleSkip} className="gap-2 text-muted-foreground">
                  <SkipForward className="w-4 h-4" /> Skip
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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

                {/* Analysis links */}
                <div className="flex items-center justify-center gap-3 text-xs">
                  <a
                    href={lichessAnalysisUrl(current.fen)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Lichess
                  </a>
                  <a
                    href={chesscomAnalysisUrl(current.fen)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Chess.com
                  </a>
                </div>

                <div className="flex justify-center">
                  <Button onClick={advance} className="gap-2">
                    Next →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Score bar */}
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <span className="text-emerald-400">✓ {score.correct}</span>
          <span className="text-red-400">✗ {score.wrong}</span>
          <span>⏭ {score.skipped}</span>
        </div>
      </div>
    </div>
  );
}
