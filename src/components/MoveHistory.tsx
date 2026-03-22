import React from "react";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";

interface MoveHistoryProps {
  moves: { san: string; moveNumber: number; isWhite: boolean }[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: { number: number; white?: string; black?: string }[] = [];
  moves.forEach((m) => {
    if (m.isWhite) {
      pairs.push({ number: m.moveNumber, white: m.san });
    } else {
      if (pairs.length > 0 && !pairs[pairs.length - 1].black) {
        pairs[pairs.length - 1].black = m.san;
      } else {
        pairs.push({ number: m.moveNumber, black: m.san });
      }
    }
  });

  return (
    <div className="rounded-xl p-4" style={{ background: "hsl(var(--card))" }}>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
        {t("moveHistory")}
      </h4>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {pairs.length === 0 && (
          <p className="text-sm text-muted-foreground/50 italic">{t("playFirstMove")}</p>
        )}
        {pairs.map((pair, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-muted-foreground/40 font-mono text-xs w-6 text-right">
              {pair.number}.
            </span>
            <span className="font-mono text-foreground/80 w-14">{pair.white || ""}</span>
            <span className="font-mono text-foreground/60 w-14">{pair.black || ""}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
