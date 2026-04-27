import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OpeningCard from "@/components/OpeningCard";
import { openings } from "@/data/openingTrees";
import { getFocusedOpenings, toggleFocus } from "@/lib/focusStore";
import { t } from "@/lib/i18n";

export default function Bookshelf() {
  const navigate = useNavigate();
  const [focusedIds, setFocusedIds] = useState(getFocusedOpenings);

  const handleToggleFocus = useCallback((openingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFocus(openingId);
    setFocusedIds(next);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="px-6 pt-10 pb-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {t("yourBookshelf")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse and study pre-built openings.
          </p>
        </motion.div>
      </header>

      <main className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {openings.map((opening, i) => (
            <OpeningCard
              key={opening.id}
              opening={opening}
              onClick={() => navigate(`/study/${opening.id}`)}
              index={i}
              focused={focusedIds.includes(opening.id)}
              onToggleFocus={(e) => handleToggleFocus(opening.id, e)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
