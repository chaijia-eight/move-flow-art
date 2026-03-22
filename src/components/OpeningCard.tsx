import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { themes, type Opening } from "@/data/openings";
import { extractAllLines } from "@/lib/lineExtractor";
import { getOpeningProgress } from "@/lib/progressStore";
import { t, tn, tDesc } from "@/lib/i18n";

interface OpeningCardProps {
  opening: Opening;
  onClick: () => void;
  index: number;
}

export default function OpeningCard({ opening, onClick, index }: OpeningCardProps) {
  const theme = themes[opening.themeId];
  const isAvailable = true;

  const { totalLines, progress } = useMemo(() => {
    const lines = extractAllLines(opening);
    const lineIds = lines.map((l) => l.id);
    return {
      totalLines: lines.length,
      progress: getOpeningProgress(lineIds),
    };
  }, [opening]);

  const openingName = tn("openingName", opening.id);
  const familyName = tn("familyName", opening.family);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isAvailable ? { 
        y: -4, 
        boxShadow: `0 20px 40px -15px ${theme.primaryColor}50`,
        transition: { duration: 0.3 } 
      } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      onClick={isAvailable ? onClick : undefined}
      className={`relative group rounded-xl overflow-hidden ${isAvailable ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
      style={{
        background: `linear-gradient(145deg, hsl(var(--card)), hsl(var(--card)) 80%)`,
        border: `1px solid ${theme.primaryColor}30`,
      }}
    >
      <div 
        className="h-1.5"
        style={{ background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})` }}
      />

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 20%, ${theme.boardLight}, transparent 70%)`,
        }}
      />

      <div className="p-5 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-foreground transition-colors">
              {openingName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              {familyName} {t("family")}
            </p>
          </div>

          <div className="relative w-11 h-11 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke={theme.accentColor} strokeWidth="2.5"
                strokeDasharray={`${progress * 94.25} 94.25`} strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-mono text-muted-foreground">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tDesc(opening.id, opening.description)}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {opening.variations.length} {t("variations")} · {totalLines} {t("lines")}
          </span>
          {isAvailable ? (
            <span 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: theme.accentColor }}
            >
              {progress > 0 ? t("continuePracticing") : t("beginStudy")}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">{t("comingSoon")}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
