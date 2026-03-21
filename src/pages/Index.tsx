import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OpeningCard from "@/components/OpeningCard";
import { openings } from "@/data/openings";

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
              progress={opening.id === "italian-game" ? 0.15 : 0}
              onClick={() => navigate(`/study/${opening.id}`)}
              index={i}
            />
          ))}
        </div>

        {/* Discovery section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Featured
            </h2>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(345 45% 35% / 0.15), hsl(38 70% 55% / 0.08))",
              border: "1px solid hsl(38 70% 55% / 0.15)",
            }}
          >
            <div className="relative z-10">
              <h3 className="font-serif text-3xl font-semibold text-foreground mb-2">
                The Italian Game
              </h3>
              <p className="text-muted-foreground max-w-lg leading-relaxed">
                Begin your journey with one of chess's oldest and most elegant openings.
                Develop your bishop to c4, target the f7 square, and discover the rich
                world of the Giuoco Piano and Two Knights Defense.
              </p>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/study/italian-game")}
                className="mt-5 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, hsl(345 45% 35%), hsl(345 40% 45%))",
                  color: "hsl(35 20% 90%)",
                  boxShadow: "0 4px 15px hsl(345 45% 35% / 0.3)",
                }}
              >
                Start Exploring
              </motion.button>
            </div>

            {/* Decorative chess piece */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[8rem] opacity-[0.06] font-serif pointer-events-none select-none">
              ♗
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
