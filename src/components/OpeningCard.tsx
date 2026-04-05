import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { themes, type Opening } from "@/data/openings";
import { extractAllLines } from "@/lib/lineExtractor";
import { getOpeningProgress } from "@/lib/progressStore";
import { getOpeningFen } from "@/lib/openingFen";
import MiniBoard from "@/components/MiniBoard";
import { t, tn, tDesc } from "@/lib/i18n";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface OpeningCardProps {
  opening: Opening;
  onClick: () => void;
  index: number;
  focused?: boolean;
  onToggleFocus?: (e: React.MouseEvent) => void;
  compact?: boolean;
}

export default function OpeningCard({ opening, onClick, index, focused, onToggleFocus, compact }: OpeningCardProps) {
  const theme = themes[opening.themeId];
  const { isPro } = useSubscription();
  const isWhite = opening.primarySide === "w";

  const { totalLines, totalMoves, progress, openingFen } = useMemo(() => {
    const lines = extractAllLines(opening);
    const lineIds = lines.map((l) => l.id);
    const totalMoves = lines.reduce((sum, l) => sum + l.moves.length, 0);
    return {
      totalLines: lines.length,
      totalMoves,
      progress: getOpeningProgress(lineIds),
      openingFen: getOpeningFen(opening),
    };
  }, [opening]);

  const openingName = tn("openingName", opening.id);
  const familyName = tn("familyName", opening.family);

  const mastered = progress >= 1;

  const cardBg = mastered
    ? theme.primaryColor
    : isWhite
      ? "hsl(40 15% 95%)"
      : "hsl(0 0% 12%)";
  const cardText = mastered
    ? "hsl(0 0% 100%)"
    : isWhite
      ? "hsl(0 0% 10%)"
      : "hsl(0 0% 92%)";
  const cardMuted = mastered
    ? "hsla(0, 0%, 100%, 0.7)"
    : isWhite
      ? "hsl(0 0% 45%)"
      : "hsl(0 0% 55%)";
  const sideBadgeBg = mastered
    ? "hsla(0, 0%, 100%, 0.15)"
    : isWhite
      ? "hsl(0 0% 100%)"
      : "hsl(0 0% 5%)";
  const sideBadgeBorder = mastered
    ? "hsla(0, 0%, 100%, 0.25)"
    : isWhite
      ? "hsl(0 0% 80%)"
      : "hsl(0 0% 30%)";

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative cursor-pointer rounded-lg overflow-hidden flex items-center gap-3 px-4 py-3 depth-card depth-card-hover"
        style={{
          background: cardBg,
          border: `1px solid ${sideBadgeBorder}`,
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0"
          style={{
            background: sideBadgeBg,
            border: `1.5px solid ${sideBadgeBorder}`,
            color: cardMuted,
          }}
        >
          {isWhite ? "W" : "B"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: cardText }}>{openingName}</p>
          <p className="text-[11px] truncate" style={{ color: cardMuted }}>
            {Math.round(progress * 100)}% · {totalLines} {t("lines")} · {totalMoves} {t("moves")}
          </p>
        </div>
        {onToggleFocus && (
          <button
            onClick={onToggleFocus}
            className="p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
          >
            <Star className="w-3.5 h-3.5" style={{ color: cardMuted }} fill="currentColor" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group rounded-xl overflow-hidden cursor-pointer depth-card depth-card-hover"
      style={{
        background: cardBg,
        border: `1px solid ${sideBadgeBorder}`,
      }}
    >
      {/* Accent bar */}
      <div
        className="h-1.5"
        style={{
          background: isPro
            ? `linear-gradient(90deg, hsl(42 90% 60%), ${theme.primaryColor}, ${theme.accentColor}, hsl(42 90% 60%))`
            : `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
        }}
      />

      {/* Theme color wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: mastered
            ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
            : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
          opacity: mastered ? 0.35 : 0.07,
        }}
      />

      <div className="p-4 relative">
        <div className="flex gap-3">
          {/* Mini board */}
          <div className="w-28 h-28 flex-shrink-0 rounded overflow-hidden shadow-sm" style={{ border: `1px solid ${sideBadgeBorder}` }}>
            <MiniBoard
              fen={openingFen}
              theme={theme}
              flipped={opening.primarySide === "b"}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0"
                    style={{
                      background: sideBadgeBg,
                      border: `1.5px solid ${sideBadgeBorder}`,
                      color: cardMuted,
                    }}
                  >
                    {isWhite ? "W" : "B"}
                  </div>
                  <h3
                    className="text-sm font-semibold truncate leading-tight"
                    style={{ color: mastered ? "hsl(0 0% 100%)" : theme.accentColor }}
                  >
                    {openingName}
                  </h3>
                </div>
                <p className="text-[10px] uppercase tracking-wider ml-6" style={{ color: cardMuted }}>
                  {familyName}
                </p>
              </div>

              {/* Progress ring */}
              <div className="relative w-9 h-9 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={mastered ? "hsla(0,0%,100%,0.25)" : isWhite ? "hsl(0 0% 85%)" : "hsl(0 0% 22%)"}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={mastered ? "hsl(0 0% 100%)" : theme.accentColor}
                    strokeWidth="2.5"
                    strokeDasharray={`${progress * 94.25} 94.25`} strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-[0.5rem] font-mono"
                  style={{ color: cardMuted }}
                >
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] leading-relaxed line-clamp-2 mt-1 ml-6" style={{ color: cardMuted }}>
              {tDesc(opening.id, opening.description)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: `1px solid ${sideBadgeBorder}` }}>
          <span className="text-[11px]" style={{ color: cardMuted }}>
            {opening.variations.length} {t("variations")} · {totalLines} {t("lines")} · {totalMoves} {t("moves")}
          </span>
          <div className="flex items-center gap-2">
            {onToggleFocus && (
              <button
                onClick={onToggleFocus}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title={focused ? "Remove from focus" : "Add to focus"}
              >
                <Star
                  className="w-3.5 h-3.5 transition-colors"
                  style={{ color: mastered ? "hsl(0 0% 100%)" : focused ? theme.accentColor : cardMuted }}
                  fill={focused ? "currentColor" : "none"}
                />
              </button>
            )}
            <span
              className="text-[11px] font-medium transition-colors duration-300"
              style={{ color: mastered ? "hsla(0,0%,100%,0.9)" : theme.accentColor }}
            >
              {mastered ? "✓ " + t("mastered") : progress > 0 ? t("continuePracticing") : t("beginStudy")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
