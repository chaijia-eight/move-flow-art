import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ChevronRight, Trophy, BookOpen, Target } from "lucide-react";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { extractAllLines, extractLinesForVariation } from "@/lib/lineExtractor";
import { getLineProgress, getOpeningProgress } from "@/lib/progressStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Recommendation {
  openingId: string;
  openingName: string;
  variationId: string;
  variationName: string;
  lineIndex: number;
  reason: string;
  color: "w" | "b";
  progress: number;
  themeId: string;
}

function getRecommendation(): Recommendation | null {
  // Priority 1: Find an in-progress opening (has some attempts but not fully mastered)
  // Priority 2: Find the next untouched opening
  let bestInProgress: Recommendation | null = null;
  let bestUntouched: Recommendation | null = null;

  for (const opening of openings) {
    const allLines = extractAllLines(opening);
    const lineIds = allLines.map((l) => l.id);
    const openingProg = getOpeningProgress(lineIds);

    if (openingProg >= 1) continue; // fully mastered

    for (const variation of opening.variations) {
      const varLines = extractLinesForVariation(opening, variation);
      for (let i = 0; i < varLines.length; i++) {
        const line = varLines[i];
        const lp = getLineProgress(line.id);

        if (lp.mastered) continue;

        const rec: Recommendation = {
          openingId: opening.id,
          openingName: opening.name,
          variationId: variation.id,
          variationName: variation.name,
          lineIndex: i,
          color: opening.primarySide,
          progress: openingProg,
          themeId: opening.themeId,
          reason:
            lp.attempts > 0
              ? `Continue practicing — ${lp.correctAttempts}/${lp.attempts} correct`
              : "Start this line",
        };

        if (lp.attempts > 0 && !bestInProgress) {
          bestInProgress = rec;
        } else if (lp.attempts === 0 && !bestUntouched && !bestInProgress) {
          bestUntouched = rec;
        }

        if (bestInProgress) break;
      }
      if (bestInProgress) break;
    }
    if (bestInProgress) break;
  }

  return bestInProgress || bestUntouched || null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { recommendation, stats } = useMemo(() => {
    const rec = getRecommendation();

    let totalLines = 0;
    let masteredLines = 0;
    let totalAttempts = 0;
    let openingsStarted = 0;

    for (const opening of openings) {
      const allLines = extractAllLines(opening);
      totalLines += allLines.length;
      let started = false;
      for (const line of allLines) {
        const lp = getLineProgress(line.id);
        if (lp.mastered) masteredLines++;
        totalAttempts += lp.attempts;
        if (lp.attempts > 0) started = true;
      }
      if (started) openingsStarted++;
    }

    return {
      recommendation: rec,
      stats: { totalLines, masteredLines, totalAttempts, openingsStarted, totalOpenings: openings.length },
    };
  }, []);

  const recTheme = recommendation ? themes[recommendation.themeId] : null;

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, hsl(38 60% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 70% 100%, hsl(345 45% 35% / 0.04), transparent 50%)",
        }}
      />

      <header className="relative z-10 px-6 pt-12 pb-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground text-sm mb-4 flex items-center gap-1 transition-colors">
            ← Back to Garden
          </button>
          <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base">Your next step awaits.</p>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 pb-16 max-w-3xl mx-auto space-y-8">
        {/* Recommended Next Step */}
        {recommendation && recTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
              Recommended Next Step
            </h2>
            <div
              className="rounded-xl border border-border overflow-hidden cursor-pointer group"
              onClick={() =>
                navigate(
                  `/study/${recommendation.openingId}/play?color=${recommendation.color}&variation=${recommendation.variationId}&line=${recommendation.lineIndex}`
                )
              }
            >
              {/* Theme accent bar */}
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${recTheme.primaryColor}, ${recTheme.accentColor})` }} />

              <div className="p-6 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {recommendation.openingName}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-1 truncate">
                      {recommendation.variationName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{recommendation.reason}</p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Opening progress</span>
                        <span>{Math.round(recommendation.progress * 100)}%</span>
                      </div>
                      <Progress value={recommendation.progress * 100} className="h-1.5" />
                    </div>
                  </div>

                  <Button size="lg" className="shrink-0 gap-2 group-hover:scale-105 transition-transform">
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-8 text-center"
          >
            <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">All Mastered!</h3>
            <p className="text-sm text-muted-foreground mb-4">You've mastered every line. Impressive.</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Browse Openings
            </Button>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Progress
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Lines Mastered", value: `${stats.masteredLines}/${stats.totalLines}`, icon: Trophy },
              { label: "Openings Started", value: `${stats.openingsStarted}/${stats.totalOpenings}`, icon: BookOpen },
              { label: "Total Attempts", value: String(stats.totalAttempts), icon: Target },
              {
                label: "Mastery",
                value: stats.totalLines > 0 ? `${Math.round((stats.masteredLines / stats.totalLines) * 100)}%` : "0%",
                icon: ChevronRight,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <Icon className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
