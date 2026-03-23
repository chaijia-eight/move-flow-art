import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, RefreshCw, Loader2 } from "lucide-react";
import { t, tf, tn } from "@/lib/i18n";

const DEVELOPER_EMAIL = "xinya.vivian@me.com";

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
  allMoves: string[]; // full line moves for generation
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
}: StudySidebarProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDeveloper = user?.email === DEVELOPER_EMAIL;

  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);

  // Fetch explanations
  const fetchExplanations = useCallback(async () => {
    // Fetch ALL explanations for this opening (across all lines/variations)
    const { data } = await supabase
      .from("move_explanations")
      .select("move_index, move_san, explanation, variation_id, line_index")
      .eq("opening_id", openingId);

    if (data) {
      const map: Record<number, string> = {};
      // First pass: collect explanations from any line that shares the same move
      data.forEach((row: any) => {
        const idx = row.move_index as number;
        const san = row.move_san as string;
        // Only use if the move SAN matches our line's move at this index
        if (idx < allMoves.length && san === allMoves[idx] && !map[idx]) {
          map[idx] = row.explanation;
        }
      });
      // Second pass: override with line-specific explanations (higher priority)
      data.forEach((row: any) => {
        if (row.variation_id === variationId && row.line_index === lineIndex) {
          map[row.move_index] = row.explanation;
        }
      });
      setExplanations(map);
      return Object.keys(map).length;
    }
    return 0;
  }, [openingId, variationId, lineIndex, allMoves]);

  // Generate explanations via edge function
  const generateExplanations = useCallback(async () => {
    if (generating || allMoves.length === 0) return;
    setGenerating(true);

    try {
      // First, check which moves already have explanations from other lines
      const { data: existing } = await supabase
        .from("move_explanations")
        .select("move_index, move_san, explanation")
        .eq("opening_id", openingId);

      const existingMap: Record<number, string> = {};
      if (existing) {
        existing.forEach((row: any) => {
          const idx = row.move_index as number;
          if (idx < allMoves.length && row.move_san === allMoves[idx]) {
            existingMap[idx] = row.explanation;
          }
        });
      }

      // Find which moves still need explanations
      const missingIndices = allMoves.map((_, i) => i).filter(i => !existingMap[i]);

      let newExplanations: Record<number, string> = { ...existingMap };

      if (missingIndices.length > 0) {
        const missingMoves = missingIndices.map(i => allMoves[i]);
        const { data, error } = await supabase.functions.invoke("generate-explanations", {
          body: {
            openingName,
            variationName: lineName,
            lineName,
            moves: allMoves,
            playerSide,
            onlyIndices: missingIndices,
          },
        });

        if (error) throw error;
        if (!data?.explanations) throw new Error("No explanations returned");

        const explanationsList: string[] = data.explanations;
        // Map generated explanations back to their indices
        if (explanationsList.length === allMoves.length) {
          // Full generation
          missingIndices.forEach(i => {
            newExplanations[i] = explanationsList[i];
          });
        } else {
          // Partial generation matching missingIndices
          missingIndices.forEach((moveIdx, arrIdx) => {
            if (arrIdx < explanationsList.length) {
              newExplanations[moveIdx] = explanationsList[arrIdx];
            }
          });
        }

        // Save only the new explanations
        const rows = missingIndices
          .filter(i => newExplanations[i])
          .map(i => ({
            opening_id: openingId,
            variation_id: variationId,
            line_index: lineIndex,
            move_index: i,
            move_san: allMoves[i],
            explanation: newExplanations[i],
          }));

        if (rows.length > 0) {
          await supabase.from("move_explanations").insert(rows);
        }
      }

      setExplanations(newExplanations);
    } catch (err) {
      console.error("Failed to generate explanations:", err);
    } finally {
      setGenerating(false);
    }
  }, [generating, allMoves, openingName, lineName, playerSide, openingId, variationId, lineIndex]);

  useEffect(() => {
    fetchExplanations().then((count) => {
      // Auto-generate only for developer
      if (isDeveloper && count === 0 && allMoves.length > 0) {
        generateExplanations();
      }
    });
  }, [openingId, variationId, lineIndex]);

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

  const handleSave = async (moveIndex: number) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("move_explanations")
      .select("id")
      .eq("opening_id", openingId)
      .eq("variation_id", variationId)
      .eq("line_index", lineIndex)
      .eq("move_index", moveIndex)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("move_explanations")
        .update({ explanation: editText, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("move_explanations").insert({
        opening_id: openingId,
        variation_id: variationId,
        line_index: lineIndex,
        move_index: moveIndex,
        move_san: allMoves[moveIndex] || "",
        explanation: editText,
      });
    }

    setExplanations((prev) => ({ ...prev, [moveIndex]: editText }));
    setEditingIndex(null);
    setSaving(false);
  };

  const handleStartEdit = (moveIndex: number) => {
    setEditingIndex(moveIndex);
    setEditText(explanations[moveIndex] || "");
  };

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
          <div className="flex items-center gap-2">
            {isDeveloper && (
              <button
                onClick={generateExplanations}
                disabled={generating}
                className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                title="Regenerate explanations"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <span className="text-xs text-muted-foreground">#{lineIndex + 1}</span>
          </div>
        </div>
      </div>

      {/* Current explanation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-center">
        {/* Generating indicator */}
        {generating && Object.keys(explanations).length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating explanations...</span>
          </div>
        )}

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
                Let's learn the <strong>{lineName}</strong>. Make your first move!
              </div>
            </motion.div>
          )}

          {/* Show only the latest player move explanation */}
          {(() => {
            if (lineCompleted || showMasteryPrompt || moveHistory.length === 0 || isChallengeMode) return null;
            // Find the latest player move
            let showIdx = -1;
            for (let i = moveHistory.length - 1; i >= 0; i--) {
              const m = moveHistory[i];
              const isPlayer = playerSide === "w" ? m.isWhite : !m.isWhite;
              if (isPlayer) { showIdx = i; break; }
            }
            if (showIdx === -1) return null;

            const latestMove = moveHistory[showIdx];
            const explanation = explanations[showIdx];
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
                  {editingIndex === showIdx ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-lg bg-muted/50 border border-border/50 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(showIdx)}
                          disabled={saving}
                          className="px-3 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground"
                        >
                          {saving ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                        isDeveloper ? "cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" : ""
                      }`}
                      style={{
                        background: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                      }}
                      onClick={() => isDeveloper && handleStartEdit(showIdx)}
                      title={isDeveloper ? "Click to edit" : undefined}
                    >
                      {explanation ? (
                        <span>{explanation}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {isDeveloper ? (
                            <span className="italic">Click to add explanation...</span>
                          ) : (
                            <span className="font-mono">
                              {latestMove.moveNumber}{latestMove.isWhite ? "." : "..."} {latestMove.san}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
