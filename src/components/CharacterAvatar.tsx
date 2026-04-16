import React from "react";
import { motion } from "framer-motion";
import { getRankForXp, getStreakLabel, type RankDef } from "@/data/rpgData";

interface Props {
  xp: number;
  streakDays: number;
  mainPillar?: string | null;
  equippedTitle?: string | null;
  size?: "sm" | "md" | "lg";
}

const pillarWeapon: Record<string, string> = {
  tactical: "🗡️",
  positional: "🪄",
  endgame: "🛡️",
};

const rankGlow: Record<string, string> = {
  novice: "",
  apprentice: "drop-shadow(0 0 12px rgba(96,165,250,0.5))",
  smith: "drop-shadow(0 0 16px rgba(168,85,247,0.5))",
  tactician: "drop-shadow(0 0 20px rgba(251,146,60,0.6))",
  grandmaster: "drop-shadow(0 0 28px rgba(250,204,21,0.7))",
};

const sizeMap = { sm: "text-3xl", md: "text-6xl", lg: "text-8xl" };
const containerSize = { sm: "w-16 h-16", md: "w-28 h-28", lg: "w-40 h-40" };

export default function CharacterAvatar({ xp, streakDays, mainPillar, equippedTitle, size = "md" }: Props) {
  const rank = getRankForXp(xp);
  const streakLabel = getStreakLabel(streakDays);
  const weapon = mainPillar ? pillarWeapon[mainPillar] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`${containerSize[size]} rounded-full flex items-center justify-center relative`}
        style={{
          background: `radial-gradient(circle, hsl(var(--card)) 60%, transparent)`,
          filter: rankGlow[rank.id] || undefined,
        }}
      >
        <span className={`${sizeMap[size]} select-none`}>{rank.icon}</span>
        {weapon && (
          <span className="absolute -right-1 -bottom-1 text-xl">{weapon}</span>
        )}
        {rank.id === "grandmaster" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ boxShadow: "0 0 30px 10px rgba(250,204,21,0.3)" }}
          />
        )}
      </motion.div>

      <div className="text-center">
        <p className={`font-bold text-sm ${rank.color}`}>{rank.label}</p>
        {equippedTitle && (
          <p className="text-xs text-yellow-400/80 italic">"{equippedTitle}"</p>
        )}
        {streakLabel && (
          <p className="text-xs text-orange-400 font-medium">
            🔥 {streakLabel} ({streakDays}d)
          </p>
        )}
      </div>
    </div>
  );
}
