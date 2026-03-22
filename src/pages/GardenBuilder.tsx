import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2, Undo2 } from "lucide-react";
import { Chess } from "chess.js";
import Chessboard from "@/components/Chessboard";
import { getEngine } from "@/lib/stockfishEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import type { MoveCategory, Opening } from "@/data/openings";

const MIN_MOVES = 9;
const MAX_MOVES = 16;

interface MoveRecord {
  san: string;
  uci: string;
  fen: string;
  engineSuggestion?: string;
  engineSuggestionSan?: string;
  isEngineSuggestion?: boolean;
  isLocked?: boolean; // Locked = from opening prefix, can't undo
}

// Extract the first few moves from an opening tree (the common trunk before variations branch)
function extractOpeningPrefix(opening: Opening): { moves: string[]; fens: string[] } {
  const moves: string[] = [];
  const fens: string[] = [];
  let nodes = opening.tree;
  
  while (nodes.length > 0) {
    // Follow the main_line path
    const mainNode = nodes.find(n => n.category === "main_line") || nodes[0];
    moves.push(mainNode.move);
    fens.push(mainNode.fen);
    
    // If there are multiple children (branching point), stop here
    if (mainNode.children.length > 1) {
      // Include one more level to get past the branch point
      break;
    }
    if (mainNode.children.length === 0) break;
    nodes = mainNode.children;
  }
  
  return { moves, fens };
}

// ============= Opening Picker =============
function OpeningPicker({ onSelect }: { onSelect: (opening: Opening) => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t("back")}</span>
        </button>
      </header>
      <main className="px-6 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            {t("pickOpening")}
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-lg">
            {t("pickOpeningDesc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {openings.map((opening, i) => {
            const theme = themes[opening.themeId];
            const prefix = extractOpeningPrefix(opening);
            return (
              <motion.div
                key={opening.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl overflow-hidden cursor-pointer border border-border bg-card group"
                onClick={() => onSelect(opening)}
              >
                <div
                  className="h-1.5"
                  style={{
                    background: theme
                      ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`
                      : "hsl(var(--primary))",
                  }}
                />
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {opening.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {opening.primarySide === "w" ? "White" : "Black"} · {opening.family}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {prefix.moves.slice(0, 6).join(" ")}
                    {prefix.moves.length > 6 ? "…" : ""}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ============= Builder (main board UI) =============
export default function GardenBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [lockedCount, setLockedCount] = useState(0); // Number of prefix moves that can't be undone
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
  const engineInitRef = useRef(false);

  // When an opening is selected, pre-fill its prefix moves
  const handleOpeningSelect = useCallback((opening: Opening) => {
    setSelectedOpening(opening);
    const prefix = extractOpeningPrefix(opening);
    
    // Play all prefix moves on the game
    const records: MoveRecord[] = [];
    for (let i = 0; i < prefix.moves.length; i++) {
      game.move(prefix.moves[i]);
      records.push({
        san: prefix.moves[i],
        uci: "",
        fen: prefix.fens[i],
        isEngineSuggestion: true,
        isLocked: true,
      });
    }
    setMoves(records);
    setLockedCount(records.length);
    setFen(game.fen());
  }, [game]);

  // Get engine suggestion after opening is selected
  useEffect(() => {
    if (!selectedOpening || engineInitRef.current) return;
    engineInitRef.current = true;
    getEngineSuggestion(game.fen());
  }, [selectedOpening]);

  const side = selectedOpening?.primarySide || "w";

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
      if (feedback) return;

      const moveUci = from + to;

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

      setEvaluating(true);
      try {
        game.undo();
        const preFen = game.fen();
        const engine = getEngine();
        const evaluation = await engine.evaluateMove(preFen, moveUci, san, 12);
        game.move(san);

        if (evaluation.isGood) {
          setFeedback({
            type: "good",
            message: evaluation.explanation,
            playerSan: san,
            engineSan: engineSuggestion?.san || evaluation.bestMoveSan,
          });
        } else {
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
    acceptPlayerMove();
  }, [acceptPlayerMove]);

  const dismissBadFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (moves.length <= lockedCount) return; // Can't undo past prefix
    game.undo();
    setMoves((prev) => prev.slice(0, -1));
    setFen(game.fen());
    setFeedback(null);
    getEngineSuggestion(game.fen());
  }, [game, moves.length, lockedCount, getEngineSuggestion]);

  const canFinish = moves.length >= MIN_MOVES;
  const isMaxed = moves.length >= MAX_MOVES;

  const handleFinish = () => {
    if (!canFinish) return;
    setShowNameDialog(true);
    setLineName(`${selectedOpening?.name || "Custom"} Line`);
  };

  const handleSave = async () => {
    if (!user || !canFinish || !selectedOpening) return;
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
        opening_id: selectedOpening.id,
      } as any);

      if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Show opening picker if nothing selected yet
  if (!selectedOpening) {
    return <OpeningPicker onSelect={handleOpeningSelect} />;
  }

  const moveHints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
  if (engineSuggestion && !feedback) {
    const from = engineSuggestion.uci.slice(0, 2);
    const to = engineSuggestion.uci.slice(2, 4);
    const targets = new Map<string, MoveCategory>();
    targets.set(to, "main_line");
    moveHints.set(from, { category: "main_line", targets });
  }

  const openingTheme = themes[selectedOpening.themeId];

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedOpening(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back")}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={moves.length <= lockedCount}
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
                  style={{ background: openingTheme ? openingTheme.primaryColor : "hsl(var(--primary))" }}
                  animate={{ width: `${(moves.length / MAX_MOVES) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Opening badge */}
            <div
              className="rounded-lg border border-border p-3 flex items-center gap-3"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: openingTheme ? openingTheme.primaryColor : "hsl(var(--primary))",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("baseOpening")}</p>
                <p className="font-serif font-semibold text-foreground truncate">{selectedOpening.name}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">
                {t("buildingLine")}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {t("depth")}: {moves.length}/{MAX_MOVES}
              </p>

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
                  const isLocked = i < lockedCount;
                  return (
                    <span key={i} className="inline-block mr-1">
                      {isWhiteMove && (
                        <span className="text-xs text-muted-foreground mr-1">{moveNum}.</span>
                      )}
                      <span
                        className={`text-sm font-mono ${
                          isLocked
                            ? "text-muted-foreground/60"
                            : move.isEngineSuggestion
                            ? "text-primary"
                            : "text-accent-foreground"
                        }`}
                      >
                        {move.san}
                      </span>
                    </span>
                  );
                })}
                {lockedCount > 0 && moves.length > lockedCount && (
                  <div className="border-t border-border/30 my-1" />
                )}
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
