import React from "react";
import { motion } from "framer-motion";
import { Play, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { getLineProgress } from "@/lib/progressStore";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { openings } from "@/data/openingTrees";

interface GardenCardProps {
  line: {
    id: string;
    name: string;
    moves: string[];
    side: string;
    move_count: number;
    created_at: string;
    opening_id?: string;
  };
  index: number;
  onPractice: () => void;
}

export default function GardenCard({ line, index, onPractice }: GardenCardProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const progress = getLineProgress(`garden-${line.id}`);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this line?")) return;
    await supabase.from("custom_lines").delete().eq("id", line.id);
    queryClient.invalidateQueries({ queryKey: ["custom-lines", user?.id] });
  };

  const movesPreview = line.moves.slice(0, 6).join(" ");
  const isWhite = line.side === "w";
  const baseOpening = line.opening_id ? openings.find(o => o.id === line.opening_id) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
      onClick={onPractice}
    >
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))`,
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-foreground truncate">
              {line.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              {isWhite ? "White" : "Black"} · {line.move_count} moves
            </p>
          </div>

          <div className="relative w-11 h-11 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                strokeDasharray={`${(progress.mastered ? 1 : progress.correctAttempts / 3) * 94.25} 94.25`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-mono text-muted-foreground">
              {progress.mastered ? "✓" : `${progress.correctAttempts}/3`}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono truncate mb-3">
          {movesPreview}{line.moves.length > 6 ? "..." : ""}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <button
            onClick={handleDelete}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            {t("deleteLine")}
          </button>
          <span className="text-xs font-medium text-primary flex items-center gap-1">
            <Play className="w-3 h-3" />
            {t("practiceCustom")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
