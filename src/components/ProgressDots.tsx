import React from "react";
import { motion } from "framer-motion";

interface ProgressDotsProps {
  total: number;
  current: number; // number of moves completed by the player
  results: ("correct" | "alternative" | "mistake" | "pending")[];
}

export default function ProgressDots({ total, current, results }: ProgressDotsProps) {
  const dots = Array.from({ length: total }, (_, i) => results[i] || "pending");

  const colorMap = {
    correct: "hsl(140, 65%, 45%)",
    alternative: "hsl(140, 45%, 55%)",
    mistake: "hsl(0, 65%, 50%)",
    pending: "hsl(var(--muted))",
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {dots.map((status, i) => (
        <motion.div
          key={i}
          initial={i === current - 1 ? { scale: 0.5 } : false}
          animate={{ scale: 1 }}
          className="rounded-sm"
          style={{
            width: Math.max(6, Math.min(16, 200 / total)),
            height: Math.max(6, Math.min(16, 200 / total)),
            background: colorMap[status],
            opacity: status === "pending" ? 0.35 : 1,
          }}
        />
      ))}
    </div>
  );
}
