import React from "react";
import { motion } from "framer-motion";

export default function Connect() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Connect Your Account</h1>
        <p className="text-muted-foreground mb-8">
          Link your chess platform to import games and generate personalized drill decks.
        </p>

        <div className="grid gap-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="w-full p-6 rounded-xl border border-border bg-card text-left hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#769656] flex items-center justify-center text-white font-bold text-xl">
                ♞
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chess.com</h3>
                <p className="text-sm text-muted-foreground">Enter your username to import games</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2 }}
            className="w-full p-6 rounded-xl border border-border bg-card text-left hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#302e2b] flex items-center justify-center text-white font-bold text-xl">
                ♞
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Lichess</h3>
                <p className="text-sm text-muted-foreground">Connect via OAuth to import games</p>
              </div>
            </div>
          </motion.button>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-6 text-center">
          We only read your game history. No moves are made on your behalf.
        </p>
      </div>
    </div>
  );
}
