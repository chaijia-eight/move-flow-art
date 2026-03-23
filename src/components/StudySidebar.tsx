import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
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

  // Explanations from DB
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch explanations
  useEffect(() => {
    const fetchExplanations = async () => {
      const { data } = await supabase
        .from("move_explanations")
        .select("move_index, explanation")
        .eq("opening_id", openingId)
        .eq("variation_id", variationId)
        .eq("line_index", lineIndex);

      if (data) {
        const map: Record<number, string> = {};
        data.forEach((row: any) => {
          map[row.move_index] = row.explanation;
        });
        setExplanations(map);
      }
    };
    fetchExplanations();
  }, [openingId, variationId, lineIndex]);

  // Auto-scroll to bottom on new moves
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
            <span className="text-sm text-muted-foreground">{openingName}</span>
          </div>
          <span className="text-xs text-muted-foreground">#{lineIndex + 1}</span>
        </div>
      </div>

      {/* Scrollable move explanations */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <AnimatePresence initial={false}>
          {moveHistory.map((move, idx) => {
            const explanation = explanations[idx];
            const pieceIcon = move.isWhite ? "/pieces/wP.svg" : "/pieces/bP.svg";
            // Use king icon for the piece indicator
            const kingIcon = move.isWhite ? "/pieces/wK.svg" : "/pieces/bK.svg";

            return (
              <motion.div
                key={`move-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex items-start gap-2.5"
              >
                {/* Piece icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <img src={kingIcon} alt={move.isWhite ? "White" : "Black"} className="w-5 h-5" />
                </div>

                {/* Explanation bubble */}
                <div className="flex-1 min-w-0">
                  {editingIndex === idx ? (
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
                          onClick={() => handleSave(idx)}
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
                      className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                        isDeveloper ? "cursor-pointer hover:ring-1 hover:ring-primary/30" : ""
                      }`}
                      style={{
                        background: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                      }}
                      onClick={() => isDeveloper && handleStartEdit(idx)}
                      title={isDeveloper ? "Click to edit" : undefined}
                    >
                      {explanation || (
                        <span className="text-muted-foreground italic">
                          {isDeveloper
                            ? "Click to add explanation..."
                            : `${move.moveNumber}${move.isWhite ? "." : "..."} ${move.san}`}
                        </span>
                      )}
                      {explanation && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {move.moveNumber}{move.isWhite ? "." : "..."} {move.san}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

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

              {/* Action buttons */}
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

        {/* Empty state at start */}
        {moveHistory.length === 0 && !lineCompleted && (
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-0.5">
              <img src="/pieces/wK.svg" alt="Guide" className="w-5 h-5" />
            </div>
            <div
              className="rounded-lg px-3 py-2 text-sm leading-relaxed"
              style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
            >
              {explanations[-1] || (
                <span>
                  Let's learn the <strong>{lineName}</strong>. Make your first move!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
