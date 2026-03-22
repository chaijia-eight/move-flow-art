import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OpeningCard from "@/components/OpeningCard";
import { openings } from "@/data/openingTrees";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 0%, hsl(38 60% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 70% 100%, hsl(345 45% 35% / 0.04), transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-5xl font-bold text-foreground tracking-tight">
            First Move
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-md leading-relaxed">
            Explore chess openings at your own pace. No pressure, no streaks — just beautiful learning.
          </p>
        </motion.div>
      </header>

      {/* Opening Garden */}
      <main className="relative z-10 px-6 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Your Garden
          </h2>
          <div className="flex-1 h-px bg-border/50" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {openings.map((opening, i) => (
            <OpeningCard
              key={opening.id}
              opening={opening}
              onClick={() => navigate(`/study/${opening.id}`)}
              index={i}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
