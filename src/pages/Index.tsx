import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ChevronRight, Trophy, BookOpen, Target, Settings, Info } from "lucide-react";
import OpeningCard from "@/components/OpeningCard";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { extractAllLines, extractLinesForVariation } from "@/lib/lineExtractor";
import { getLineProgress, getOpeningProgress } from "@/lib/progressStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { t, tf, tn, tDesc } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  let bestInProgress: Recommendation | null = null;
  let bestUntouched: Recommendation | null = null;

  for (const opening of openings) {
    const allLines = extractAllLines(opening);
    const lineIds = allLines.map((l) => l.id);
    const openingProg = getOpeningProgress(lineIds);

    if (openingProg >= 1) continue;

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
              ? tf<(c: number, t: number) => string>("continueReason")(lp.correctAttempts, lp.attempts)
              : t("startThisLine"),
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

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: customLines = [] } = useQuery({
    queryKey: ["custom-lines", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("custom_lines")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

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
      stats: { totalLines, masteredLines, totalAttempts, openingsStarted, totalOpenings: openings.length, customLines: customLines.length },
    };
  }, [customLines.length]);

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

      <header className="relative z-10 px-6 pt-12 pb-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-5xl font-bold text-foreground tracking-tight">
                BookChess
              </h1>
              <p className="text-muted-foreground mt-2 text-lg max-w-md leading-relaxed">
                {t("appTagline")}
              </p>
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => navigate("/about")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="About"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={t("settings")}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 pb-16 max-w-5xl mx-auto space-y-10">
        <section className="max-w-3xl">
          {recommendation && recTheme && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
                {t("recommendedNextStep")}
              </h2>
              <div
                className="rounded-xl border border-border overflow-hidden cursor-pointer group"
                onClick={() =>
                  navigate(
                    `/study/${recommendation.openingId}/play?color=${recommendation.color}&variation=${recommendation.variationId}&line=${recommendation.lineIndex}`
                  )
                }
              >
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${recTheme.primaryColor}, ${recTheme.accentColor})` }} />
                <div className="p-6 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {tn("openingName", recommendation.openingId)}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-1 truncate">
                        {recommendation.variationName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("openingProgress")}</span>
                          <span>{Math.round(recommendation.progress * 100)}%</span>
                        </div>
                        <Progress value={recommendation.progress * 100} className="h-1.5" />
                      </div>
                    </div>
                    <Button size="lg" className="shrink-0 gap-2 group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4" />
                      {t("start")}
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
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-8 text-center"
            >
              <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{t("allMastered")}</h3>
              <p className="text-sm text-muted-foreground">{t("allMasteredDesc")}</p>
            </motion.div>
          )}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl"
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
            {t("progress")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t("linesMastered"), value: `${stats.masteredLines}/${stats.totalLines}`, icon: Trophy },
              { label: t("openingsStarted"), value: `${stats.openingsStarted}/${stats.totalOpenings}`, icon: BookOpen },
              { label: t("totalAttempts"), value: String(stats.totalAttempts), icon: Target },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <Icon className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("yourBookshelf")}
            </h2>
            <div className="flex-1 h-px bg-border/50" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openings.map((opening, i) => (
              <OpeningCard
                key={opening.id}
                opening={opening}
                onClick={() => navigate(`/study/${opening.id}`)}
                index={i}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
