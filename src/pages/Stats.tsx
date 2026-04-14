import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function Stats() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-8">Your Stats</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground text-lg mb-2">No data yet</p>
          <p className="text-muted-foreground/70 text-sm">
            Connect your account and complete some drills to see your progress stats.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
