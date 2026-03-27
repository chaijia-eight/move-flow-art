import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, ExternalLink, Crown } from "lucide-react";
import { t, tf } from "@/lib/i18n";

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
}: StudySidebarProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { isPro, canAnalyze, recordAnalysisUse } = useSubscription();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLichessAnalysis = () => {
    // Record usage for free users
    if (user && !isPro) {
      recordAnalysisUse();
    }
    // Build Lichess analysis URL from FEN
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
                      background: "hsl(45, 100%, 50%, 0.12)",
                      color: "hsl(45, 100%, 45%)",
                      border: "1px solid hsl(45, 100%, 50%, 0.25)",
                    }}
                  >
                    🛡️ {crucialMomentMessage}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Show the latest player move (just the move notation, no explanation) */}
          {(() => {
            if (lineCompleted || showMasteryPrompt || moveHistory.length === 0 || isChallengeMode) return null;
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
                    style={{
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  >
                    <span className="text-muted-foreground font-mono">
                      {latestMove.moveNumber}{latestMove.isWhite ? "." : "..."} {latestMove.san}
                    </span>
                  </div>
                </div>
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