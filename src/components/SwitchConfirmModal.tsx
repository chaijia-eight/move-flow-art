import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SwitchConfirmModalProps {
  open: boolean;
  playerMoveScore: number | null;
  masterMoveScore: number | null;
  playerMoveSan: string;
  masterMoveSan: string;
  onAdopt: () => void;
  onStay: () => void;
}

function formatEval(cp: number | null): string {
  if (cp === null) return "?";
  const sign = cp >= 0 ? "+" : "";
  return `${sign}${(cp / 100).toFixed(2)}`;
}

export default function SwitchConfirmModal({
  open,
  playerMoveScore,
  masterMoveScore,
  playerMoveSan,
  masterMoveSan,
  onAdopt,
  onStay,
}: SwitchConfirmModalProps) {
  const { currentTheme } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-background rounded-t-2xl p-6 relative"
          >
            <button
              onClick={onStay}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h3 className="font-serif text-lg font-semibold text-foreground text-center mb-4">
              Are you sure you want to switch to your new move?
            </h3>

            <div className="flex justify-between mb-6 px-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Your move: {formatEval(playerMoveScore)}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{playerMoveSan}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Master move: {formatEval(masterMoveScore)}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{masterMoveSan}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAdopt}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border/50 text-foreground hover:bg-accent transition-colors"
              >
                Adopt New
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStay}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-background transition-colors"
                style={{ background: currentTheme.accentColor }}
              >
                Stay on Course
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
