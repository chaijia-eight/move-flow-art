import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import type { MoveCategory } from "@/data/openings";
import { t } from "@/lib/i18n";

interface FeedbackBannerProps {
  type: MoveCategory;
  message: string;
  variationName?: string;
  suggestedMove?: string;
  onSwitch?: () => void;
  onStay?: () => void;
  onRetry?: () => void;
}

export default function FeedbackBanner({
  type,
  message,
  variationName,
  suggestedMove,
  onSwitch,
  onStay,
  onRetry,
}: FeedbackBannerProps) {
  const { currentTheme } = useTheme();

  const bgMap = {
    main_line: `linear-gradient(135deg, ${currentTheme.accentColor}20, ${currentTheme.accentColor}08)`,
    legit_alternative: `linear-gradient(135deg, hsl(180 40% 55% / 0.15), hsl(180 40% 55% / 0.05))`,
    mistake: `linear-gradient(135deg, hsl(0 72% 50% / 0.15), hsl(0 72% 50% / 0.05))`,
  };

  const borderMap = {
    main_line: currentTheme.accentColor,
    legit_alternative: "hsl(180, 40%, 55%)",
    mistake: "hsl(0, 72%, 50%)",
  };

  const iconMap = {
    main_line: "✦",
    legit_alternative: "⬡",
    mistake: "⚠",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl overflow-hidden backdrop-blur-sm"
      style={{
        background: bgMap[type],
        borderLeft: `3px solid ${borderMap[type]}`,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg mt-0.5" style={{ color: borderMap[type] }}>
            {iconMap[type]}
          </span>
          <div className="flex-1 min-w-0">
            {variationName && (
              <p className="font-serif text-sm italic mb-1" style={{ color: borderMap[type] }}>
                {variationName}
              </p>
            )}
            <p className="text-sm leading-relaxed text-foreground/90">{message}</p>
            {suggestedMove && (
              <p className="text-sm mt-1 text-foreground/70">
                {t("tryInstead")} <span className="font-mono font-medium" style={{ color: borderMap[type] }}>{suggestedMove}</span> {t("instead")}
              </p>
            )}
          </div>
        </div>

        {type === "legit_alternative" && onSwitch && onStay && (
          <div className="flex gap-2 mt-3 ml-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitch}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300"
              style={{
                background: borderMap[type],
                color: "hsl(var(--background))",
              }}
            >
              {t("switchBtn")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStay}
              className="px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-300"
              style={{
                borderColor: `${borderMap[type]}50`,
                color: borderMap[type],
              }}
            >
              {t("stayBtn")}
            </motion.button>
          </div>
        )}

        {type === "mistake" && onRetry && (
          <div className="mt-3 ml-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300"
              style={{
                background: borderMap[type],
                color: "white",
              }}
            >
              {t("tryAgain")}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
