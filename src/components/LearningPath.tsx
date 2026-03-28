import React from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { getLineProgress, isLineUnlocked } from "@/lib/progressStore";
import type { Line } from "@/lib/lineExtractor";
import type { OpeningTheme } from "@/data/openings";
import type { VariationInfo } from "@/data/openings";
import { tVar } from "@/lib/i18n";

interface VariationSection {
  variation: VariationInfo;
  lines: Line[];
}

interface LearningPathProps {
  sections: VariationSection[];
  theme: OpeningTheme;
  openingId: string;
  primarySide: "w" | "b";
  onNavigate: (variationId: string, lineIndex: number) => void;
  activeLineId?: string | null;
}

const MASTERY_THRESHOLD = 3;
const ZIGZAG_PATTERN = [0, 1, 1.5, 1, 0, -1, -1.5, -1];

export default function LearningPath({ sections, theme, onNavigate, activeLineId }: LearningPathProps) {
  // Flatten all nodes with their section info for global zigzag indexing
  let globalIndex = 0;

  return (
    <div className="relative flex flex-col items-center py-6 px-4">
      {sections.map((section, si) => {
        const lineIds = section.lines.map((l) => l.id);
        const sectionStartIndex = globalIndex;

        const nodes = section.lines.map((line, li) => {
          const i = globalIndex++;
          const prog = getLineProgress(line.id);
          const unlocked = isLineUnlocked(line.id, lineIds);
          const isMastered = prog.mastered;
          const correctRatio = Math.min(prog.correctAttempts / MASTERY_THRESHOLD, 1);
          const xOffset = ZIGZAG_PATTERN[i % ZIGZAG_PATTERN.length] * 36;

          const size = 44;
          const strokeWidth = 3;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference * (1 - correctRatio);

          const isLocked = !unlocked;
          const hasAttempts = prog.attempts > 0;
          const isActive = activeLineId === line.id;

          return (
            <motion.button
              key={line.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              whileHover={unlocked ? { scale: 1.18 } : {}}
              whileTap={unlocked ? { scale: 0.92 } : {}}
              onClick={() => unlocked && onNavigate(section.variation.id, li)}
              className="relative z-10 flex-shrink-0"
              style={{
                marginTop: li === 0 ? 0 : 20,
                transform: `translateX(${xOffset}px)`,
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
              title={unlocked ? line.name : "Locked"}
            >
              {/* Active glow */}
              {isActive && (
                <div
                  className="absolute inset-[-4px] rounded-full animate-pulse"
                  style={{ boxShadow: `0 0 16px 4px ${theme.accentColor}60` }}
                />
              )}
              <svg width={size} height={size} className="block">
                <circle
                  cx={size / 2} cy={size / 2} r={radius}
                  fill="none"
                  stroke={isLocked ? "hsl(var(--muted-foreground) / 0.12)" : `${theme.accentColor}25`}
                  strokeWidth={strokeWidth}
                />
                {correctRatio > 0 && (
                  <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={theme.accentColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className="transition-all duration-500"
                  />
                )}
                <circle
                  cx={size / 2} cy={size / 2}
                  r={radius - strokeWidth - 1}
                  fill={
                    isLocked ? "hsl(var(--muted) / 0.6)"
                      : isMastered ? theme.accentColor
                        : hasAttempts ? theme.accentColor
                          : theme.primaryColor
                  }
                  opacity={isLocked ? 0.35 : hasAttempts || isMastered ? 1 : 0.5}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isLocked ? (
                  <Lock className="w-3 h-3 text-muted-foreground/40" />
                ) : isMastered ? (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                ) : (
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: hasAttempts ? "white" : "hsl(var(--foreground) / 0.6)" }}
                  >
                    {li + 1}
                  </span>
                )}
              </div>
            </motion.button>
          );
        });

        return (
          <div key={section.variation.id} className="flex flex-col items-center w-full">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sectionStartIndex * 0.02 }}
              className="text-center mb-3"
              style={{ marginTop: si > 0 ? 32 : 0 }}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono mb-0.5">
                Unit {si + 1}
              </p>
              <p className="text-xs font-semibold text-foreground/80 font-serif">
                {tVar(section.variation.id, "name", section.variation.name)}
              </p>
              {/* Divider dot */}
              <div
                className="w-1.5 h-1.5 rounded-full mx-auto mt-2"
                style={{ background: theme.accentColor }}
              />
            </motion.div>

            {nodes}
          </div>
        );
      })}
    </div>
  );
}
