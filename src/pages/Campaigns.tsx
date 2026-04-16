import React from "react";
import { motion } from "framer-motion";
import { Map, Swords, Brain, Crown, Lock } from "lucide-react";

const branches = [
  {
    id: "tactics",
    name: "Tactics",
    icon: Swords,
    color: "text-red-400",
    borderColor: "border-red-500/30",
    description: "Forks, pins, skewers, discovered attacks, and more. Sharpen your calculation.",
    skills: ["Forks", "Pins", "Skewers", "Discovered Attacks", "Double Checks", "Back Rank"],
  },
  {
    id: "positional",
    name: "Positional Play",
    icon: Brain,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    description: "Weak squares, piece activity, pawn structure, and strategic thinking.",
    skills: ["Weak Squares", "Outposts", "Pawn Structure", "Piece Activity", "Space Advantage"],
  },
  {
    id: "endgames",
    name: "Endgames",
    icon: Crown,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    description: "King and pawn, rook endings, and technique. The foundation of chess mastery.",
    skills: ["King & Pawn", "Rook Endings", "Bishop vs Knight", "Queen Endings", "Tablebase Positions"],
  },
];

export default function Campaigns() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Map className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-foreground">Campaigns</h1>
          </div>
          <p className="text-muted-foreground">
            Your skill trees. Level up based on your real game mistakes.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {branches.map((branch, i) => {
            const Icon = branch.icon;
            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl border ${branch.borderColor} bg-card p-6`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-card border border-border ${branch.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{branch.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{branch.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {branch.skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground"
                        >
                          <Lock className="w-3 h-3" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-center">
                  <p className="text-sm text-muted-foreground italic">Coming soon — connect your account and analyze games to unlock.</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
