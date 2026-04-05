import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, ExternalLink, Crown, Pencil, Check, X } from "lucide-react";
import { t, tf } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
}

interface StudySidebarProps {
  openingId: string;
  variationId: string;
  lineIndex: number;
  openingName: string;
  lineName: string;
  playerSide: "w" | "b";
  allMoves: string[];
  moveHistory: MoveRecord[];
  lineCompleted: boolean;
  hadMistake: boolean;
  isChallengeMode: boolean;
  showMasteryPrompt: boolean;
  lineProgress: { correctAttempts: number; mastered: boolean } | null;
  totalPlayerMoves: number;
  playerMovesCompleted: number;
  onReset: () => void;
  onNextLine: () => void;
  onMasteryResponse: (mastered: boolean) => void;
  hasNextLine: boolean;
  conclusionText?: string;
  crucialMomentMessage?: string | null;
  isTrap?: boolean;
  fen: string;
  moveExplanations?: Record<number, string>;
}

export default function StudySidebar({
  openingId,
  variationId,
  lineIndex,
  openingName,
  lineName,
  playerSide,
  allMoves,
  moveHistory,
  lineCompleted,
  hadMistake,
  isChallengeMode,
  showMasteryPrompt,
  lineProgress,
  totalPlayerMoves,
  playerMovesCompleted,
  onReset,
  onNextLine,
  onMasteryResponse,
  hasNextLine,
  conclusionText,
  crucialMomentMessage,
  isTrap,
  fen,
  moveExplanations = {},
}: StudySidebarProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { isPro, canAnalyze, recordAnalysisUse } = useSubscription();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDev = user?.email === "xinya.vivian@me.com";
  const [editingMoveIdx, setEditingMoveIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [savingExplanation, setSavingExplanation] = useState(false);

  const handleSaveExplanation = useCallback(async (moveIdx: number, san: string) => {
    setSavingExplanation(true);
    const text = editText.trim();
    if (text) {
      await supabase.from("move_explanations").upsert({
        opening_id: openingId,
        variation_id: variationId,
        line_index: lineIndex,
        move_index: moveIdx,
        move_san: san,
        explanation: text,
        updated_at: new Date().toISOString(),
      }, { onConflict: "opening_id,variation_id,line_index,move_index" });
      // Update local state
      if (moveExplanations) moveExplanations[moveIdx] = text;
    }
    setEditingMoveIdx(null);
    setSavingExplanation(false);
  }, [editText, openingId, variationId, lineIndex, moveExplanations]);
  const handleLichessAnalysis = () => {
    if (user && !isPro) {
      recordAnalysisUse();
    }
    const encodedFen = fen.replace(/ /g, "_");
    const color = playerSide === "w" ? "white" : "black";
    window.open(`https://lichess.org/analysis/${encodedFen}?color=${color}`, "_blank");
  };

  // Auto-scroll to bottom on new moves
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [moveHistory.length, lineCompleted]);

  // Build the "current pair" of explanations to show.
  // A pair = the most recent player move + the following opponent move (if any).
  // The pair persists until the NEXT player move is made.
  const currentExplanationPair = React.useMemo(() => {
    if (moveHistory.length === 0) return [];
    const hasExplanations = Object.keys(moveExplanations).length > 0;
    if (!hasExplanations) return [];

    // Find the latest player move index in moveHistory
    let lastPlayerHistIdx = -1;
    for (let i = moveHistory.length - 1; i >= 0; i--) {
      const m = moveHistory[i];
      const isPlayer = playerSide === "w" ? m.isWhite : !m.isWhite;
      if (isPlayer) { lastPlayerHistIdx = i; break; }
    }

    // The pair starts from the move BEFORE the last player move (the opponent move that triggered it)
    // or from the player move itself if it's the first in a pair.
    // We want to show: [playerMove, opponentResponse?] based on the current moveHistory position.
    
    // Strategy: find the last player move's 0-based move index in allMoves,
    // then show that move's explanation + the following move's explanation
    const pair: { moveIndex: number; san: string; moveNumber: number; isWhite: boolean; explanation: string }[] = [];
    
    // Determine which move indices have been played
    const movesPlayed = moveHistory.length; // 0-based count of moves played

    // Find the start of the current "pair" - the last player move index
    let pairStartIdx = -1;
    for (let i = movesPlayed - 1; i >= 0; i--) {
      const isWhiteMove = i % 2 === 0;
      const isPlayerMove = (playerSide === "w") === isWhiteMove;
      if (isPlayerMove) { pairStartIdx = i; break; }
    }

    if (pairStartIdx === -1) {
      // No player move yet - might be opponent's first move (playing as black)
      // Show explanation for move index 0 if it exists (opponent's first move)
      if (movesPlayed >= 1 && moveExplanations[0]) {
        const m = moveHistory[0];
        pair.push({
          moveIndex: 0,
          san: m.san,
          moveNumber: m.moveNumber,
          isWhite: m.isWhite,
          explanation: moveExplanations[0],
        });
      }
      return pair;
    }

    // Add the player move explanation
    if (moveExplanations[pairStartIdx]) {
      const m = moveHistory[pairStartIdx];
      pair.push({
        moveIndex: pairStartIdx,
        san: m.san,
        moveNumber: m.moveNumber,
        isWhite: m.isWhite,
        explanation: moveExplanations[pairStartIdx],
      });
    }

    // Add the opponent response explanation (next move after player move)
    const responseIdx = pairStartIdx + 1;
    if (responseIdx < movesPlayed && moveExplanations[responseIdx]) {
      const m = moveHistory[responseIdx];
      pair.push({
        moveIndex: responseIdx,
        san: m.san,
        moveNumber: m.moveNumber,
        isWhite: m.isWhite,
        explanation: moveExplanations[responseIdx],
      });
    }

    return pair;
  }, [moveHistory, moveExplanations, playerSide, isChallengeMode, allMoves]);

  return (
    <div className="flex flex-col h-full bg-background border-l border-border/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📖</span>
            <span className="text-sm font-semibold text-foreground">Learn</span>
            <span className="text-sm text-muted-foreground truncate max-w-[140px]">{openingName}</span>
          </div>
          <span className="text-xs text-muted-foreground">#{lineIndex + 1}</span>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Empty state at start */}
          {moveHistory.length === 0 && !lineCompleted && !showMasteryPrompt && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-2.5"
            >
              <div className="flex-shrink-0 mt-1">
                <img
                  src={playerSide === "w" ? "/pieces/wK.svg" : "/pieces/bK.svg"}
                  alt="Guide"
                  className="w-5 h-5"
                />
              </div>
              <div
                className="rounded-lg px-3 py-2 text-sm leading-relaxed"
                style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
              >
                Play the move indicated by the arrow.
              </div>
            </motion.div>
          )}

          {/* Crucial moment message */}
          {crucialMomentMessage && !lineCompleted && !showMasteryPrompt && moveHistory.length > 0 && !isChallengeMode && (() => {
            const lastMove = moveHistory[moveHistory.length - 1];
            const isOpponentMove = playerSide === "w" ? !lastMove.isWhite : lastMove.isWhite;
            if (!isOpponentMove) return null;
            const opponentIcon = playerSide === "w" ? "/pieces/bK.svg" : "/pieces/wK.svg";
            return (
              <motion.div
                key="crucial-moment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2.5"
              >
                <div className="flex-shrink-0 mt-1">
                  <img src={opponentIcon} alt="Opponent" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="rounded-lg px-3 py-2.5 text-sm leading-relaxed font-medium"
                    style={{
                      background: isTrap ? "hsl(0, 72%, 50%, 0.12)" : "hsl(45, 100%, 50%, 0.12)",
                      color: isTrap ? "hsl(0, 72%, 45%)" : "hsl(45, 100%, 45%)",
                      border: isTrap ? "1px solid hsl(0, 72%, 50%, 0.25)" : "1px solid hsl(45, 100%, 50%, 0.25)",
                    }}
                  >
                    {isTrap ? "⚠️" : "🛡️"} {crucialMomentMessage}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Move explanations (paired display) */}
          {(() => {
            if (lineCompleted || showMasteryPrompt) return null;
            if (currentExplanationPair.length === 0) {
              // Fallback: show latest player move notation (no explanation)
              if (moveHistory.length === 0) return null;
              // Skip if crucial moment is showing
              if (crucialMomentMessage && moveHistory.length > 0) {
                const lastMove = moveHistory[moveHistory.length - 1];
                const isOpponentMove = playerSide === "w" ? !lastMove.isWhite : lastMove.isWhite;
                if (isOpponentMove) return null;
              }
              let showIdx = -1;
              for (let i = moveHistory.length - 1; i >= 0; i--) {
                const m = moveHistory[i];
                const isPlayer = playerSide === "w" ? m.isWhite : !m.isWhite;
                if (isPlayer) { showIdx = i; break; }
              }
              if (showIdx === -1) return null;
              const latestMove = moveHistory[showIdx];
              const kingIcon = playerSide === "w" ? "/pieces/wK.svg" : "/pieces/bK.svg";
              return (
                <motion.div
                  key={`move-${showIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="flex-shrink-0 mt-1">
                    <img src={kingIcon} alt="You" className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="rounded-lg px-3 py-2.5 text-sm leading-relaxed"
                      style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
                    >
                      <span className="text-muted-foreground font-mono">
                        {latestMove.moveNumber}{latestMove.isWhite ? "." : "..."} {latestMove.san}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Show paired explanations
            return (
              <motion.div
                key={`pair-${currentExplanationPair[0]?.moveIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl px-4 py-3 space-y-2.5"
                style={{
                  background: "hsl(var(--accent) / 0.35)",
                  color: "hsl(var(--accent-foreground))",
                }}
              >
                {currentExplanationPair.map((entry) => (
                  <div key={entry.moveIndex} className="text-sm leading-relaxed">
                    <span
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold rounded px-1.5 py-0.5 mr-1.5"
                      style={{
                        background: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                      }}
                    >
                      {entry.moveNumber}{entry.isWhite ? "." : "..."}
                      <img
                        src={entry.isWhite ? "/pieces/wP.svg" : "/pieces/bP.svg"}
                        alt=""
                        className="w-3.5 h-3.5 inline"
                      />
                      {entry.san}
                    </span>
                    <span className="font-medium">{entry.explanation}</span>
                  </div>
                ))}
              </motion.div>
            );
          })()}

          {/* Line completed state */}
          {lineCompleted && !showMasteryPrompt && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 pt-2"
            >
              <div
                className="rounded-lg px-3 py-3 text-sm text-center"
                style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
              >
                <Trophy className="w-5 h-5 mx-auto mb-1.5" style={{ color: currentTheme.accentColor }} />
                <p className="font-semibold text-sm">
                  {hadMistake ? t("lineCompleted") : t("perfectRun")}
                </p>
                {conclusionText && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{conclusionText}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onReset}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border/50 text-foreground hover:bg-accent transition-colors"
                >
                  {t("practiceAgain")}
                </button>
                {hasNextLine && (
                  <button
                    onClick={onNextLine}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium text-background transition-colors"
                    style={{ background: currentTheme.accentColor }}
                  >
                    Continue
                  </button>
                )}
              </div>

              {/* Lichess Analysis */}
              {(isPro || canAnalyze) && (
                <button
                  onClick={handleLichessAnalysis}
                  className="w-full py-2 rounded-lg text-xs font-medium border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("lichessAnalysis")}
                  {!isPro && <span className="text-[10px] opacity-60">({t("oncePerDay")})</span>}
                </button>
              )}
            </motion.div>
          )}

          {/* Mastery prompt */}
          {showMasteryPrompt && (
            <motion.div
              key="mastery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              <div
                className="rounded-lg px-3 py-3 text-sm text-center"
                style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
              >
                <Trophy className="w-6 h-6 mx-auto mb-1.5" style={{ color: currentTheme.accentColor }} />
                <p className="font-semibold text-sm">{t("masteryQuestion")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tf<(c: number) => string>("completedCorrectly")(
                    lineProgress ? lineProgress.correctAttempts + 1 : 3
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onMasteryResponse(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border/50 text-foreground transition-colors"
                >
                  {t("notYet")}
                </button>
                <button
                  onClick={() => onMasteryResponse(true)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium text-background transition-colors"
                  style={{ background: currentTheme.accentColor }}
                >
                  {t("yesMastered")}
                </button>
              </div>

              {/* Lichess Analysis */}
              {(isPro || canAnalyze) && (
                <button
                  onClick={handleLichessAnalysis}
                  className="w-full py-2 rounded-lg text-xs font-medium border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("lichessAnalysis")}
                  {!isPro && <span className="text-[10px] opacity-60">({t("oncePerDay")})</span>}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
