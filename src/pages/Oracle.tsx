import React from "react";
import { motion } from "framer-motion";
import { Eye, Shield, Swords, Lock } from "lucide-react";

const categories = [
  { name: "King & Pawn vs King", pieces: "K+P vs K", difficulty: "Beginner" },
  { name: "King & Rook vs King", pieces: "K+R vs K", difficulty: "Beginner" },
  { name: "King & Queen vs King", pieces: "K+Q vs K", difficulty: "Beginner" },
  { name: "Rook vs Pawn", pieces: "K+R vs K+P", difficulty: "Intermediate" },
  { name: "Rook & Pawn vs Rook", pieces: "K+R+P vs K+R", difficulty: "Advanced" },
  { name: "Bishop & Pawn Endings", pieces: "K+B+P vs K+B", difficulty: "Advanced" },
];

export default function Oracle() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Eye className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-serif font-bold text-foreground">The Oracle</h1>
          </div>
          <p className="text-muted-foreground">
            Endgame mastery. Practice mathematically solved positions against perfect play.
          </p>
        </motion.div>

        {/* Two modes explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-xl border border-border bg-card">
            <Shield className="w-6 h-6 text-blue-400 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Defender Mode</h3>
            <p className="text-sm text-muted-foreground">
              You're losing. Try to hold the draw against perfect play.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <Swords className="w-6 h-6 text-orange-400 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Converter Mode</h3>
            <p className="text-sm text-muted-foreground">
              You're winning. Finish it precisely — no stalemates.
            </p>
          </div>
        </div>

        {/* Endgame categories */}
        <div className="grid gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card opacity-60"
            >
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.pieces}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                {cat.difficulty}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground italic">
            Endgame tablebases coming soon. Positions will be loaded from Syzygy tables.
          </p>
        </div>
      </div>
    </div>
  );
}
