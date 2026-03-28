import React from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { getLineProgress, isLineUnlocked } from "@/lib/progressStore";
import type { Line } from "@/lib/lineExtractor";
import type { OpeningTheme } from "@/data/openings";

interface LearningPathProps {
  lines: Line[];
  theme: OpeningTheme;
  onNavigate: (lineIndex: number) => void;
}

const MASTERY_THRESHOLD = 3;

// Zigzag x-offsets: center → right → center → left → repeat
const ZIGZAG_PATTERN = [0, 1, 1.5, 1, 0, -1, -1.5, -1];

export default function LearningPath({ lines, theme, onNavigate }: LearningPathProps) {
  if (lines.length === 0) return null;

  const lineIds = lines.map((l) => l.id);

  return (
    <div className="relative flex flex-col items-center py-4 px-2">
      {lines.map((line, i) => {
        const prog = getLineProgress(line.id);
        const unlocked = isLineUnlocked(line.id, lineIds);
        const isMastered = prog.mastered;
        const correctRatio = Math.min(prog.correctAttempts / MASTERY_THRESHOLD, 1);

        const xOffset = ZIGZAG_PATTERN[i % ZIGZAG_PATTERN.length] * 36;

        // SVG ring params
        const size = 48;
        const strokeWidth = 3.5;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const dashOffset = circumference * (1 - correctRatio);

        const isLocked = !unlocked;
        const hasAttempts = prog.attempts > 0;

        return (
          <React.Fragment key={line.id}>
            {/* Connecting line to previous node */}
            {i > 0 && (
              <svg
                className="absolute"
                style={{
                  top: i * 72 - 24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 200,
                  height: 24,
                  overflow: "visible",
                }}
                aria-hidden
              >
                <line
                  x1={100 + ZIGZAG_PATTERN[(i - 1) % ZIGZAG_PATTERN.length] * 36}
                  y1={0}
                  x2={100 + xOffset}
                  y2={24}
                  stroke={isLocked ? "hsl(var(--muted-foreground) / 0.15)" : `${theme.accentColor}40`}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            )}

            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              whileHover={unlocked ? { scale: 1.15 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
              onClick={() => unlocked && onNavigate(i)}
              className="relative z-10 flex-shrink-0"
              style={{
                marginTop: i === 0 ? 0 : 24,
                transform: `translateX(${xOffset}px)`,
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
              title={unlocked ? line.name : "Locked"}
            >
              <svg width={size} height={size} className="block">
                {/* Background ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={isLocked ? "hsl(var(--muted-foreground) / 0.12)" : `${theme.accentColor}20`}
                  strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                {correctRatio > 0 && (
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
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
                {/* Inner circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius - strokeWidth - 1}
                  fill={
                    isLocked
                      ? "hsl(var(--muted) / 0.6)"
                      : isMastered
                        ? theme.accentColor
                        : hasAttempts
                          ? `${theme.accentColor}`
                          : `${theme.primaryColor}`
                  }
                  opacity={isLocked ? 0.4 : hasAttempts || isMastered ? 1 : 0.6}
                />
              </svg>

              {/* Icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                ) : isMastered ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: hasAttempts ? "white" : "hsl(var(--foreground) / 0.7)" }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
            </motion.button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
