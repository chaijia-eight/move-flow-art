import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2, Undo2, Trophy } from "lucide-react";
import { Chess } from "chess.js";
import Chessboard from "@/components/Chessboard";
import FeedbackBanner from "@/components/FeedbackBanner";
import MoveHistory from "@/components/MoveHistory";
import { getEngine } from "@/lib/stockfishEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { t, tf } from "@/lib/i18n";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import type { MoveCategory, Opening, OpeningNode } from "@/data/openings";

const MIN_MOVES = 9;
const MAX_MOVES = 16;

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ============= Main Garden Builder (Tree-Guided) =============
export default function GardenBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTheme, currentTheme } = useTheme();

  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  const [fen, setFen] = useState(chess.fen());
  const [currentNodes, setCurrentNodes] = useState<OpeningNode[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [lineFinished, setLineFinished] = useState(false);

  // Feedback state (same pattern as Study page)
  const [feedback, setFeedback] = useState<{
    type: MoveCategory;
    message: string;
    variationName?: string;
    suggestedMove?: string;
    alternativeNode?: OpeningNode;
  } | null>(null);

  // Engine evaluation for off-tree moves
  const [evaluating, setEvaluating] = useState(false);

  // Save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lineName, setLineName] = useState("");
  const [saving, setSaving] = useState(false);

  const initialAutoPlayed = useRef(false);

  const playerColor = selectedOpening?.primarySide || "w";
  const openingTheme = selectedOpening ? themes[selectedOpening.themeId] : null;

  // Set theme when opening is selected
  useEffect(() => {
    if (selectedOpening) setTheme(selectedOpening.themeId);
  }, [selectedOpening, setTheme]);

  const handleOpeningSelect = useCallback((opening: Opening) => {
    setSelectedOpening(opening);
    chess.reset();
    setFen(chess.fen());
    setCurrentNodes(opening.tree);
    setMoveHistory([]);
    setFeedback(null);
    setLineFinished(false);
    initialAutoPlayed.current = false;
  }, [chess]);

  // Auto-play first computer move if player is black
  useEffect(() => {
    if (initialAutoPlayed.current || !selectedOpening) return;
    if (playerColor !== "w" && selectedOpening.tree.length > 0) {
      initialAutoPlayed.current = true;
      const mainNode = selectedOpening.tree.find(n => n.category === "main_line") || selectedOpening.tree[0];
      setIsComputerTurn(true);
      setTimeout(() => {
        try {
          chess.move(mainNode.move);
          setFen(chess.fen());
          setMoveHistory([{ san: mainNode.move, moveNumber: 1, isWhite: true }]);
          setCurrentNodes(mainNode.children);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  }, [selectedOpening, playerColor, chess]);

  // Pick the main-line computer response
  const pickComputerNode = useCallback((children: OpeningNode[]): OpeningNode | null => {
    if (children.length === 0) return null;
    return children.find(c => c.category === "main_line") || children[0];
  }, []);

  // Auto-play computer move after player moves
  const autoPlayComputerMove = useCallback((children: OpeningNode[]) => {
    const chosen = pickComputerNode(children);
    if (!chosen) {
      // Tree ended
      if (moveHistory.length >= MIN_MOVES) {
        setLineFinished(true);
      }
      return;
    }

    setIsComputerTurn(true);
    setTimeout(() => {
      try {
        const result = chess.move(chosen.move);
        if (result) {
          const newFen = chess.fen();
          setFen(newFen);
          const isW = chess.turn() === "b"; // just moved was white
          const mn = Math.ceil(chess.moveNumber());
          setMoveHistory(prev => [
            ...prev,
            { san: chosen.move, moveNumber: isW ? mn : mn - 1, isWhite: isW },
          ]);
          setCurrentNodes(chosen.children);

          // Check if tree ended after computer move
          if (chosen.children.length === 0) {
            // Use a small delay so state updates
            setTimeout(() => setLineFinished(true), 100);
          }
        }
      } catch {}
      setIsComputerTurn(false);
      setFeedback(null);
    }, 600);
  }, [chess, moveHistory, pickComputerNode]);

  // Handle player move
  const handleMove = useCallback(
    async (from: string, to: string, san: string) => {
      if (isComputerTurn || lineFinished || feedback) return;
      if (moveHistory.length >= MAX_MOVES) return;

      const matchedNode = currentNodes.find(node => node.move === san);

      try {
        chess.move({ from, to });
      } catch {
        return;
      }

      const newFen = chess.fen();
      setFen(newFen);
      const isWhite = chess.turn() === "b";
      const moveNum = Math.ceil(chess.moveNumber());
      const newRecord: MoveRecord = {
        san,
        moveNumber: isWhite ? moveNum : moveNum - 1,
        isWhite,
      };
      setMoveHistory(prev => [...prev, newRecord]);

      if (!matchedNode) {
        // Move not in tree — evaluate with engine
        setEvaluating(true);
        try {
          // Undo to get pre-move FEN for evaluation
          chess.undo();
          const preFen = chess.fen();
          const moveUci = from + to;
          const engine = getEngine();
          const evaluation = await engine.evaluateMove(preFen, moveUci, san, 12);
          // Re-apply the move
          chess.move({ from, to });

          if (evaluation.isGood) {
            // Good off-tree move — allow it, but tree guidance ends
            setFeedback({
              type: "legit_alternative",
              message: `${san} ${t("moveIsGood")} ${t("weSuggest")} ${evaluation.bestMoveSan}.`,
              suggestedMove: evaluation.bestMoveSan,
            });
            setCurrentNodes([]); // No more tree guidance
          } else {
            // Bad move — reject
            chess.undo();
            setFen(chess.fen());
            setMoveHistory(prev => prev.slice(0, -1));
            setFeedback({
              type: "mistake",
              message: evaluation.explanation,
              suggestedMove: evaluation.bestMoveSan,
            });
          }
        } catch {
          // Engine failed — just allow the move
          setCurrentNodes([]);
        } finally {
          setEvaluating(false);
        }
        return;
      }

      // Move is in tree
      switch (matchedNode.category) {
        case "main_line": {
          setFeedback({
            type: "main_line",
            message: matchedNode.variationName
              ? tf<(n: string) => string>("goodThisIs")(matchedNode.variationName)
              : t("goodContinue"),
          });
          setCurrentNodes(matchedNode.children);
          autoPlayComputerMove(matchedNode.children);
          break;
        }

        case "legit_alternative": {
          // Find the main line move to show as "we recommend X"
          const mainLineNode = currentNodes.find(n => n.category === "main_line");
          const recommendedSan = mainLineNode?.move || "";
          setFeedback({
            type: "legit_alternative",
            message: tf<(n: string) => string>("alsoGood")(matchedNode.variationName || san),
            variationName: matchedNode.variationName,
            suggestedMove: recommendedSan,
            alternativeNode: matchedNode,
          });
          setCurrentNodes(matchedNode.children);
          break;
        }

        case "mistake": {
          chess.undo();
          setFen(chess.fen());
          setMoveHistory(prev => prev.slice(0, -1));
          setFeedback({
            type: "mistake",
            message: matchedNode.explanation || t("notBestMove"),
            suggestedMove: matchedNode.suggestedMove,
          });
          break;
        }
      }
    },
    [chess, currentNodes, isComputerTurn, lineFinished, feedback, moveHistory.length, autoPlayComputerMove],
  );

  // Handle switch/stay for legit_alternative
  const handleSwitch = useCallback(() => {
    // Player chose their alternative — continue with it
    setFeedback(null);
    if (currentNodes.length > 0 || feedback?.alternativeNode) {
      autoPlayComputerMove(currentNodes);
    } else if (moveHistory.length >= MIN_MOVES) {
      setLineFinished(true);
    }
  }, [currentNodes, feedback, autoPlayComputerMove, moveHistory.length]);

  const handleStay = useCallback(() => {
    // Player wants the recommended move instead — undo their move
    if (feedback?.alternativeNode) {
      chess.undo();
      setFen(chess.fen());
      setMoveHistory(prev => prev.slice(0, -1));
      // Restore parent nodes (go back to pre-move state)
      // We need to find the parent nodes — since we already set currentNodes to the alternative's children,
      // we need to restore. We'll use the opening tree to re-navigate.
      const parentNodes = reNavigateTree(selectedOpening!, moveHistory.slice(0, -1));
      setCurrentNodes(parentNodes);
    }
    setFeedback(null);
  }, [chess, feedback, selectedOpening, moveHistory]);

  // Re-navigate tree from move history to find current nodes
  function reNavigateTree(opening: Opening, history: MoveRecord[]): OpeningNode[] {
    let nodes = opening.tree;
    for (const move of history) {
      const matched = nodes.find(n => n.move === move.san);
      if (!matched) return [];
      nodes = matched.children;
    }
    return nodes;
  }

  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || isComputerTurn) return;
    // Undo last move (and computer's previous move if applicable)
    chess.undo();
    const newHistory = moveHistory.slice(0, -1);
    // If the last move was computer's, undo one more
    if (newHistory.length > 0 && chess.turn() !== playerColor) {
      chess.undo();
      newHistory.pop();
    }
    setFen(chess.fen());
    setMoveHistory(newHistory);
    setFeedback(null);
    setLineFinished(false);
    if (selectedOpening) {
      setCurrentNodes(reNavigateTree(selectedOpening, newHistory));
    }
  }, [chess, moveHistory, isComputerTurn, playerColor, selectedOpening]);

  // Build move hints from current tree nodes
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!currentNodes.length || lineFinished) return hints;
    const tempChess = new Chess(fen);
    if (tempChess.turn() !== playerColor) return hints;
    const legalMoves = tempChess.moves({ verbose: true });

    currentNodes.forEach(node => {
      if (node.category === "mistake") return; // Don't hint mistakes
      const matching = legalMoves.find(m => m.san === node.move);
      if (matching) {
        if (!hints.has(matching.from)) {
          hints.set(matching.from, { category: node.category, targets: new Map() });
        }
        hints.get(matching.from)!.targets.set(matching.to, node.category);
      }
    });
    return hints;
  }, [currentNodes, fen, playerColor, lineFinished]);

  // Save line
  const handleSave = async () => {
    if (!user || !selectedOpening || moveHistory.length < MIN_MOVES) return;
    setSaving(true);
    try {
      // Reconstruct FENs from move history
      const tempChess = new Chess();
      const fens: string[] = [];
      const moves: string[] = [];
      for (const move of moveHistory) {
        tempChess.move(move.san);
        fens.push(tempChess.fen());
        moves.push(move.san);
      }

      const { error } = await supabase.from("custom_lines").insert({
        user_id: user.id,
        name: lineName || `${selectedOpening.name} Line`,
        moves,
        fens,
        side: playerColor,
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

  // Opening picker
  if (!selectedOpening) {
    return <OpeningPicker onSelect={handleOpeningSelect} />;
  }

  const canFinish = moveHistory.length >= MIN_MOVES;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: openingTheme
            ? `radial-gradient(ellipse at 50% 0%, ${openingTheme.primaryColor}15, transparent 60%), radial-gradient(ellipse at 80% 100%, ${openingTheme.accentColor}08, transparent 50%)`
            : undefined,
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedOpening(null)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              {selectedOpening.name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {t("buildingLine")} · {moveHistory.length}/{MAX_MOVES}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={moveHistory.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30"
          >
            <Undo2 className="w-5 h-5 text-foreground/70" />
          </motion.button>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Board */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
            <Chessboard
              fen={fen}
              onMove={handleMove}
              moveHints={moveHints}
              disabled={isComputerTurn || lineFinished || evaluating || !!feedback}
              flipped={playerColor === "b"}
              playerColor={playerColor}
            />

            {/* Progress bar */}
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{moveHistory.length}/{MAX_MOVES} moves</span>
                <span>
                  {moveHistory.length < MIN_MOVES
                    ? `${MIN_MOVES - moveHistory.length} more needed`
                    : "Ready to save!"}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: openingTheme?.primaryColor || "hsl(var(--primary))" }}
                  animate={{ width: `${(moveHistory.length / MAX_MOVES) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Feedback area */}
            <div className="mt-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                {evaluating && (
                  <motion.div
                    key="evaluating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground py-4"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("evaluating")}
                  </motion.div>
                )}

                {lineFinished && !showSaveDialog && (
                  <motion.div
                    key="finished"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accentColor}15, ${currentTheme.primaryColor}10)`,
                      border: `1px solid ${currentTheme.accentColor}30`,
                    }}
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.accentColor }} />
                    <p className="font-serif text-lg font-semibold text-foreground mb-1">
                      {t("lineCompleted")}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save this line to practice and master it later.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={handleUndo}>
                        <Undo2 className="w-4 h-4 mr-1" />
                        {t("undo")}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowSaveDialog(true);
                          setLineName(`${selectedOpening.name} Line`);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t("saveLine")}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {feedback && !lineFinished && (
                  <FeedbackBanner
                    key={`fb-${moveHistory.length}`}
                    type={feedback.type}
                    message={feedback.message}
                    variationName={feedback.variationName}
                    suggestedMove={feedback.suggestedMove}
                    onSwitch={feedback.type === "legit_alternative" ? handleSwitch : undefined}
                    onStay={feedback.type === "legit_alternative" ? handleStay : undefined}
                    onRetry={feedback.type === "mistake" ? () => setFeedback(null) : undefined}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-72 space-y-4">
            <MoveHistory moves={moveHistory} />

            {/* Finish button (if not auto-finished but enough moves) */}
            {canFinish && !lineFinished && !feedback && (
              <Button
                className="w-full"
                onClick={() => {
                  setLineFinished(true);
                }}
              >
                <Check className="w-4 h-4 mr-1" />
                {t("finishLine")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                {t("saveLine")}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t("lineName")}</label>
                  <input
                    type="text"
                    value={lineName}
                    onChange={e => setLineName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={`${selectedOpening.name} Line`}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {moveHistory.length} moves · {selectedOpening.name}
                </div>
              </div>
              <div className="flex gap-2 mt-6 justify-end">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  {t("saveLine")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
