import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2, Undo2 } from "lucide-react";
import { Chess } from "chess.js";
import Chessboard from "@/components/Chessboard";
import { getEngine, type MoveEvaluation } from "@/lib/stockfishEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { MoveCategory } from "@/data/openings";

const MIN_MOVES = 9;
const MAX_MOVES = 16;

interface MoveRecord {
  san: string;
  uci: string;
  fen: string;
  engineSuggestion?: string;
  engineSuggestionSan?: string;
  isEngineSuggestion?: boolean;
}

export default function GardenBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [engineSuggestion, setEngineSuggestion] = useState<{ uci: string; san: string } | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "good" | "bad";
    message: string;
    playerSan: string;
    engineSan: string;
  } | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [lineName, setLineName] = useState("");
  const [saving, setSaving] = useState(false);
  const [side] = useState<"w" | "b">("w"); // Always build as white for now
  const engineInitRef = useRef(false);

  // Initialize engine and get first suggestion
  useEffect(() => {
    if (engineInitRef.current) return;
    engineInitRef.current = true;
    getEngineSuggestion(game.fen());
  }, []);

  const getEngineSuggestion = useCallback(async (currentFen: string) => {
    setEvaluating(true);
    setEngineSuggestion(null);
    try {
      const engine = getEngine();
      const evaluation = await engine.evaluate(currentFen, 12);
      if (evaluation.bestMove) {
        const tempChess = new Chess(currentFen);
        const from = evaluation.bestMove.slice(0, 2);
        const to = evaluation.bestMove.slice(2, 4);
        const promo = evaluation.bestMove.length > 4 ? evaluation.bestMove[4] : undefined;
        const result = tempChess.move({ from, to, promotion: promo });
        if (result) {
          setEngineSuggestion({ uci: evaluation.bestMove, san: result.san });
        }
      }
    } catch (err) {
      console.error("Engine error:", err);
    } finally {
      setEvaluating(false);
    }
  }, []);

  const handleMove = useCallback(
    async (from: string, to: string, san: string) => {
      if (moves.length >= MAX_MOVES) return;
      if (feedback) return; // Block moves while showing feedback

      const moveUci = from + to;

      // If this is the engine suggestion, accept directly
      if (engineSuggestion && moveUci === engineSuggestion.uci) {
        const newMoveRecord: MoveRecord = {
          san,
          uci: moveUci,
          fen: game.fen(),
          engineSuggestion: engineSuggestion.san,
          engineSuggestionSan: engineSuggestion.san,
          isEngineSuggestion: true,
        };
        setMoves((prev) => [...prev, newMoveRecord]);
        setFen(game.fen());
        setFeedback(null);
        getEngineSuggestion(game.fen());
        return;
      }

      // Otherwise, evaluate the move
      setEvaluating(true);
      try {
        // We need to evaluate BEFORE the move was made, so undo it
        game.undo();
        const preFen = game.fen();
        const engine = getEngine();
        const evaluation = await engine.evaluateMove(preFen, moveUci, san, 12);

        // Re-apply the move
        game.move(san);

        if (evaluation.isGood) {
          // Good move — show choice dialog
          setFeedback({
            type: "good",
            message: evaluation.explanation,
            playerSan: san,
            engineSan: engineSuggestion?.san || evaluation.bestMoveSan,
          });
          // Don't add the move yet — wait for user choice
        } else {
          // Bad move — reject and undo
          game.undo();
          setFen(game.fen());
          setFeedback({
            type: "bad",
            message: evaluation.explanation,
            playerSan: san,
            engineSan: evaluation.bestMoveSan,
          });
        }
      } catch (err) {
        console.error("Evaluation error:", err);
        // On error, accept the move
        const newMoveRecord: MoveRecord = {
          san,
          uci: moveUci,
          fen: game.fen(),
          isEngineSuggestion: false,
        };
        setMoves((prev) => [...prev, newMoveRecord]);
        setFen(game.fen());
        getEngineSuggestion(game.fen());
      } finally {
        setEvaluating(false);
      }
    },
    [game, moves.length, engineSuggestion, feedback, getEngineSuggestion]
  );

  const acceptPlayerMove = useCallback(() => {
    if (!feedback || feedback.type !== "good") return;
    const newMoveRecord: MoveRecord = {
      san: feedback.playerSan,
      uci: "",
      fen: game.fen(),
      engineSuggestion: feedback.engineSan,
      isEngineSuggestion: false,
    };
    setMoves((prev) => [...prev, newMoveRecord]);
    setFen(game.fen());
    setFeedback(null);
    getEngineSuggestion(game.fen());
  }, [feedback, game, getEngineSuggestion]);

  const keepEngineSuggestion = useCallback(() => {
    if (!feedback || feedback.type !== "good") return;
    // Undo player move and play engine move instead
    game.undo();
    const engineMove = engineSuggestion;
    if (engineMove) {
      const from = engineMove.uci.slice(0, 2);
      const to = engineMove.uci.slice(2, 4);
      const promo = engineMove.uci.length > 4 ? engineMove.uci[4] : undefined;
      game.move({ from, to, promotion: promo });
      const newMoveRecord: MoveRecord = {
        san: engineMove.san,
        uci: engineMove.uci,
        fen: game.fen(),
        isEngineSuggestion: true,
      };
      setMoves((prev) => [...prev, newMoveRecord]);
      setFen(game.fen());
    }
    setFeedback(null);
    getEngineSuggestion(game.fen());
  }, [feedback, engineSuggestion, game, getEngineSuggestion]);

  const keepBoth = useCallback(() => {
    // For now, keep the player's move (the "both" concept applies during practice)
    acceptPlayerMove();
  }, [acceptPlayerMove]);

  const dismissBadFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (moves.length === 0) return;
    game.undo();
    setMoves((prev) => prev.slice(0, -1));
    setFen(game.fen());
    setFeedback(null);
    getEngineSuggestion(game.fen());
  }, [game, moves.length, getEngineSuggestion]);

  const canFinish = moves.length >= MIN_MOVES;
  const isMaxed = moves.length >= MAX_MOVES;

  const handleFinish = () => {
    if (!canFinish) return;
    setShowNameDialog(true);
    setLineName(`Custom Line #${Date.now().toString(36).slice(-4)}`);
  };

  const handleSave = async () => {
    if (!user || !canFinish) return;
    setSaving(true);
    try {
      const movesSan = moves.map((m) => m.san);
      const fensList = moves.map((m) => m.fen);

      const { error } = await supabase.from("custom_lines").insert({
        user_id: user.id,
        name: lineName || "My Line",
        moves: movesSan,
        fens: fensList,
        side,
        move_count: moves.length,
      } as any);

      if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Build move hints for the chessboard (engine suggestion highlighted)
  const moveHints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
  if (engineSuggestion && !feedback) {
    const from = engineSuggestion.uci.slice(0, 2);
    const to = engineSuggestion.uci.slice(2, 4);
    const targets = new Map<string, MoveCategory>();
    targets.set(to, "main_line");
    moveHints.set(from, { category: "main_line", targets });
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={moves.length === 0}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Board */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[500px]">
              <Chessboard
                fen={fen}
                onMove={handleMove}
                moveHints={moveHints}
                disabled={evaluating || isMaxed || !!feedback?.type}
                flipped={side === "b"}
                playerColor={side}
              />
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[500px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {moves.length}/{MAX_MOVES} moves
                </span>
                <span>
                  {moves.length < MIN_MOVES
                    ? `${MIN_MOVES - moves.length} more needed`
                    : "Ready to finish!"}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "hsl(var(--primary))" }}
                  animate={{ width: `${(moves.length / MAX_MOVES) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">
                {t("buildingLine")}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {t("depth")}: {moves.length}/{MAX_MOVES}
              </p>

              {/* Engine suggestion */}
              {evaluating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("evaluating")}
                </div>
              )}
              {engineSuggestion && !evaluating && !feedback && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("engineSuggests")}</p>
                  <p className="font-mono text-lg font-bold text-primary">{engineSuggestion.san}</p>
                </div>
              )}

              {/* Move list */}
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                {moves.map((move, i) => {
                  const moveNum = Math.floor(i / 2) + 1;
                  const isWhiteMove = i % 2 === 0;
                  return (
                    <span key={i} className="inline-block mr-1">
                      {isWhiteMove && (
                        <span className="text-xs text-muted-foreground mr-1">{moveNum}.</span>
                      )}
                      <span
                        className={`text-sm font-mono ${
                          move.isEngineSuggestion ? "text-primary" : "text-accent-foreground"
                        }`}
                      >
                        {move.san}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background:
                      feedback.type === "good"
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))"
                        : "linear-gradient(135deg, hsl(0 72% 50% / 0.15), hsl(0 72% 50% / 0.05))",
                    borderLeft: `3px solid ${
                      feedback.type === "good" ? "hsl(var(--primary))" : "hsl(0, 72%, 50%)"
                    }`,
                  }}
                >
                  <div className="p-4">
                    <p className="text-sm text-foreground/90 mb-2">{feedback.message}</p>

                    {feedback.type === "good" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {t("weSuggest")}{" "}
                          <span className="font-mono font-bold text-primary">{feedback.engineSan}</span>
                          {". "}
                          {t("wannaSwitch")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="default" onClick={acceptPlayerMove}>
                            {t("useMyMove")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={keepEngineSuggestion}>
                            {t("keepSuggested")}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={keepBoth}>
                            {t("keepBoth")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {feedback.type === "bad" && (
                      <div className="mt-2">
                        <Button size="sm" variant="destructive" onClick={dismissBadFeedback}>
                          {t("tryAgain")}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Finish button */}
            <Button
              onClick={handleFinish}
              disabled={!canFinish}
              className="w-full gap-2"
              size="lg"
            >
              <Check className="w-4 h-4" />
              {t("finishLine")}
              {!canFinish && ` (${MIN_MOVES - moves.length} more)`}
            </Button>
          </div>
        </div>
      </main>

      {/* Name dialog */}
      <AnimatePresence>
        {showNameDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowNameDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl border border-border p-6 w-full max-w-sm mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                {t("lineName")}
              </h3>
              <input
                type="text"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. My Italian Setup"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("saveLine")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNameDialog(false)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
