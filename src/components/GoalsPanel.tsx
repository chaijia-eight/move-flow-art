import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ChevronDown, Sparkles } from "lucide-react";
import type { CoachingGoals } from "@/lib/openingCoaching";

interface Props {
  goals: CoachingGoals | null | undefined;
  loading: boolean;
  defaultOpen?: boolean;
}

export default function GoalsPanel({ goals, loading, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const hasContent =
    !!goals &&
    ((goals.keyIdeas?.length ?? 0) > 0 ||
      (goals.typicalPlans?.length ?? 0) > 0 ||
      !!goals.summary);

  return (
    <div
      className="rounded-lg border border-border/40 overflow-hidden"
      style={{ background: "hsl(var(--card))" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent/40 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-foreground/70" />
          <span className="text-xs font-semibold text-foreground">The point</span>
          {loading && !hasContent && (
            <Sparkles className="w-3 h-3 text-muted-foreground animate-pulse ml-1" />
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5 text-xs leading-relaxed">
              {!hasContent && loading && (
                <p className="text-muted-foreground italic">
                  Generating strategic briefing…
                </p>
              )}
              {!hasContent && !loading && (
                <p className="text-muted-foreground italic">
                  No coaching available for this line yet.
                </p>
              )}

              {goals?.summary && (
                <p className="text-foreground/90 font-medium">{goals.summary}</p>
              )}

              {goals?.keyIdeas && goals.keyIdeas.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Key ideas
                  </p>
                  <ul className="space-y-1">
                    {goals.keyIdeas.map((idea, i) => (
                      <li
                        key={i}
                        className="flex gap-1.5 text-foreground/85"
                      >
                        <span className="text-muted-foreground">·</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {goals?.keySquares && goals.keySquares.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Key squares
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {goals.keySquares.map((sq) => (
                      <span
                        key={sq}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-foreground"
                      >
                        {sq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {goals?.typicalPlans && goals.typicalPlans.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Typical plans
                  </p>
                  <ul className="space-y-1">
                    {goals.typicalPlans.map((p, i) => (
                      <li key={i} className="text-foreground/85">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}