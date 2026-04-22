import { AnimatePresence, motion } from "framer-motion";
import { Flame, Sparkles, Trophy } from "lucide-react";

export interface RewardEvent {
  id: number;
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  streakBumped: boolean;
  streak: number;
}

interface Props {
  event: RewardEvent | null;
}

export default function RewardToast({ event }: Props) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
            <Sparkles className="w-4 h-4" />+{event.xp} XP
          </div>
          {event.streakBumped && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5" />
              {event.streak} day streak
            </motion.div>
          )}
          {event.leveledUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40"
            >
              <Trophy className="w-3.5 h-3.5" />
              Level {event.newLevel}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
