import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Chess } from "chess.js";
import Chessboard from "@/components/Chessboard";
import MoveHistory from "@/components/MoveHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getLineProgress, recordAttempt, markMastered, MASTERY_PROMPT_THRESHOLD } from "@/lib/progressStore";
import type { MoveCategory } from "@/data/openings";

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
}

export default function GardenPractice() {
  const { lineId } = useParams<{ lineId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: customLine, isLoading } = useQuery({
    queryKey: ["custom-line", lineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_lines")
        .select("*")
        .eq("id", lineId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!lineId && !!user,
  });

  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveIndex, setMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [completed, setCompleted] = useState(false);
  const [hadMistakes, setHadMistakes] = useState(false);
  const [showMasteryPrompt, setShowMasteryPrompt] = useState(false);
  const [mistakeFeedback, setMistakeFeedback] = useState<string | null>(null);

  const progressLineId = `garden-${lineId}`;
  const progress = getLineProgress(progressLineId);

  // Determine whose turn is whose
  const lineMoves = (customLine as any)?.moves ?? [];
  const lineSide = ((customLine as any)?.side ?? "w") as "w" | "b";

  const isPlayerTurn = useCallback(() => {
    return game.turn() === lineSide;
  }, [game, lineSide]);

  // Computer plays the opponent's moves automatically
  const playComputerMove = useCallback(() => {
    if (moveIndex >= lineMoves.length) return;
    const nextSan = lineMoves[moveIndex];
    try {
      game.move(nextSan);
      setFen(game.fen());
      setMoveHistory((prev) => [
        ...prev,
        {
          san: nextSan,
          moveNumber: Math.floor((moveIndex) / 2) + 1,
          isWhite: moveIndex % 2 === 0,
        },
      ]);
      setMoveIndex((prev) => prev + 1);
    } catch {
      console.error("Computer move failed:", nextSan);
    }
  }, [game, moveIndex, lineMoves]);

  // After mount or state change, play computer move if needed
  React.useEffect(() => {
    if (!customLine || completed) return;
    if (moveIndex >= lineMoves.length) {
      // Line complete
      handleLineComplete(!hadMistakes);
      return;
    }
    if (!isPlayerTurn()) {
      const timer = setTimeout(playComputerMove, 400);
      return () => clearTimeout(timer);
    }
  }, [moveIndex, customLine, completed, isPlayerTurn, playComputerMove, lineMoves.length, hadMistakes]);

  const handleMove = useCallback(
    (_from: string, _to: string, san: string) => {
      if (completed || moveIndex >= lineMoves.length) return;
      if (!isPlayerTurn()) return;

      const expectedSan = lineMoves[moveIndex];
      if (san === expectedSan) {
        setMoveHistory((prev) => [
          ...prev,
          {
            san,
            moveNumber: Math.floor(moveIndex / 2) + 1,
            isWhite: moveIndex % 2 === 0,
          },
        ]);
        setMoveIndex((prev) => prev + 1);
        setFen(game.fen());
        setMistakeFeedback(null);
      } else {
        // Wrong move — undo
        game.undo();
        setFen(game.fen());
        setHadMistakes(true);
        setMistakeFeedback(`Expected ${expectedSan}. Try again!`);
      }
    },
    [game, moveIndex, lineMoves, completed, isPlayerTurn]
  );

  const handleLineComplete = (wasCorrect: boolean) => {
    setCompleted(true);
    const updated = recordAttempt(progressLineId, wasCorrect);
    if (wasCorrect && updated.correctAttempts >= MASTERY_PROMPT_THRESHOLD && !updated.mastered) {
      setShowMasteryPrompt(true);
    }
  };

  const handleReset = () => {
    game.reset();
    setFen(game.fen());
    setMoveIndex(0);
    setMoveHistory([]);
    setCompleted(false);
    setHadMistakes(false);
    setShowMasteryPrompt(false);
    setMistakeFeedback(null);
  };

  const handleMastery = (mastered: boolean) => {
    markMastered(progressLineId, mastered);
    setShowMasteryPrompt(false);
  };

  // Build move hints for current expected move
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (completed || moveIndex >= lineMoves.length || !isPlayerTurn()) return hints;

    const expectedSan = lineMoves[moveIndex];
    try {
      const tempChess = new Chess(fen);
      const legalMoves = tempChess.moves({ verbose: true });
      const expectedMove = legalMoves.find((m) => m.san === expectedSan);
      if (expectedMove) {
        const targets = new Map<string, MoveCategory>();
        targets.set(expectedMove.to, "main_line" as MoveCategory);
        hints.set(expectedMove.from, { category: "main_line" as MoveCategory, targets });
      }
    } catch {}
    return hints;
  }, [fen, moveIndex, lineMoves, completed, isPlayerTurn]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!customLine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Line not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back")}</span>
          </button>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            {(customLine as any).name}
          </h1>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[500px]">
              <Chessboard
                fen={fen}
                onMove={handleMove}
                moveHints={moveHints}
                disabled={completed || !isPlayerTurn()}
                flipped={lineSide === "b"}
                playerColor={lineSide}
              />
            </div>

            {/* Mistake feedback */}
            {mistakeFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[500px] rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
              >
                {mistakeFeedback}
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            {/* Progress */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t("lineProgress")}</span>
                <span className="text-xs text-muted-foreground">
                  {progress.correctAttempts} {t("correctCount")} · {progress.attempts} {t("totalCount")}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(moveIndex / lineMoves.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Move history */}
            <MoveHistory moves={moveHistory} />

            {/* Completion */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-serif text-lg font-semibold mb-1">
                  {hadMistakes ? t("lineCompleted") : t("perfectRun")}
                </h3>
                {hadMistakes && (
                  <p className="text-sm text-muted-foreground mb-3">{t("hadMistakesMsg")}</p>
                )}

                {showMasteryPrompt && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">{t("masteryQuestion")}</p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => handleMastery(true)}>
                        {t("yesMastered")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleMastery(false)}>
                        {t("notYet")}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={handleReset} variant="default">
                    {t("practiceAgain")}
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline">
                    {t("back")}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
