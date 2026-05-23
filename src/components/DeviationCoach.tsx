import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { CoachingDeviation, CoachingGoals } from "@/lib/openingCoaching";

interface Props {
  deviation: CoachingDeviation | null | undefined;
  goals: CoachingGoals | null | undefined;
}

/**
 * Shown when the player goes off the learned tree (mistake feedback).
 * Reminds them of the strategic goals and what to aim for.
 */
export default function DeviationCoach({ deviation, goals }: Props) {
  const aimFor = deviation?.aimFor;
  const principles = deviation?.generalPrinciples ?? [];
  // Fall back to the top key ideas if we have no deviation hints yet
  const reminders = principles.length > 0 ? principles : (goals?.keyIdeas ?? []).slice(0, 3);

  if (!aimFor && reminders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg px-3 py-2.5 border"
      style={{
        background: "hsl(35, 92%, 50%, 0.08)",
        borderColor: "hsl(35, 92%, 50%, 0.25)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Compass className="w-3.5 h-3.5" style={{ color: "hsl(35, 92%, 45%)" }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "hsl(35, 92%, 40%)" }}
        >
          Off book — remember the plan
        </span>
      </div>
      {aimFor && (
        <p className="text-xs text-foreground/90 mb-1.5">
          <span className="font-semibold">Aim for: </span>
          {aimFor}
        </p>
      )}
      {reminders.length > 0 && (
        <ul className="space-y-0.5 text-xs text-foreground/80">
          {reminders.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-muted-foreground">·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}