import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Trophy, BookOpen, Target, Settings, Info, Star, Crown, Zap } from "lucide-react";
import OpeningCard from "@/components/OpeningCard";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { extractAllLines, extractLinesForVariation } from "@/lib/lineExtractor";
import { getLineProgress, getOpeningProgress } from "@/lib/progressStore";
import { getFocusedOpenings, toggleFocus } from "@/lib/focusStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubscription, FREE_DAILY_LINES } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { t, tf, tn, tDesc } from "@/lib/i18n";

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
  const { user } = useAuth();
  const { isPro, dailyLinesUsed, practiceUsedToday, canLearnNewLine, canPractice, startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [focusedIds, setFocusedIds] = useState(getFocusedOpenings);

  const handleToggleFocus = useCallback((openingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFocus(openingId);
    setFocusedIds(next);
  }, []);

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

  const focusedOpenings = useMemo(() => {
    return openings.filter((o) => focusedIds.includes(o.id));
  }, [focusedIds]);

  const bookshelfOpenings = useMemo(() => {
    return openings.filter((o) => !focusedIds.includes(o.id));
  }, [focusedIds]);

  const recTheme = recommendation ? themes[recommendation.themeId] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="relative z-10 px-6 pt-10 pb-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                  ArcChess
                </h1>
                {isPro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm max-w-md">
                {t("appTagline")}
              </p>
            </div>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => navigate("/about")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="About"
              >
                <Info className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={t("settings")}
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 pb-16 max-w-5xl mx-auto space-y-8">
        {/* Recommendation */}
        <section className="max-w-3xl">
          {recommendation && recTheme && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
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
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${recTheme.primaryColor}, ${recTheme.accentColor})` }} />
                <div className="p-5 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                          {tn("openingName", recommendation.openingId)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                        {recommendation.variationName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span>{t("openingProgress")}</span>
                          <span>{Math.round(recommendation.progress * 100)}%</span>
                        </div>
                        <Progress value={recommendation.progress * 100} className="h-1" />
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
              <h3 className="text-xl font-semibold text-foreground mb-1">{t("allMastered")}</h3>
              <p className="text-sm text-muted-foreground">{t("allMasteredDesc")}</p>
            </motion.div>
          )}
        </section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-3xl"
        >
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
            {t("progress")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("linesMastered"), value: `${stats.masteredLines}/${stats.totalLines}`, icon: Trophy },
              { label: t("openingsStarted"), value: `${stats.openingsStarted}/${stats.totalOpenings}`, icon: BookOpen },
              { label: t("totalAttempts"), value: String(stats.totalAttempts), icon: Target },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-3.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground mb-1.5" />
                <p className="text-xl font-semibold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Daily Limits & Upgrade */}
        {user && !isPro && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="max-w-3xl"
          >
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              {t("dailyLimits")}
            </h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{t("newLines")}</span>
                    <span className={!canLearnNewLine ? "text-destructive font-medium" : ""}>
                      {dailyLinesUsed}/{FREE_DAILY_LINES}
                    </span>
                  </div>
                  <Progress value={(dailyLinesUsed / FREE_DAILY_LINES) * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{t("practice")}</span>
                    <span className={!canPractice ? "text-destructive font-medium" : ""}>
                      {practiceUsedToday ? "1/1" : "0/1"}
                    </span>
                  </div>
                  <Progress value={practiceUsedToday ? 100 : 0} className="h-1.5" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-primary" />
                    {t("proPlan")} — {t("proPlanPrice")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("proFeatures")}</p>
                </div>
                <Button size="sm" onClick={() => startCheckout()} className="gap-1.5 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                  {t("upgradeToPro")}
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Your Focus
            </h2>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {focusedOpenings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No focus set yet. Click the <Star className="w-3.5 h-3.5 inline -mt-0.5" /> on any opening card to add it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {focusedOpenings.map((opening, i) => (
                <OpeningCard
                  key={opening.id}
                  opening={opening}
                  onClick={() => navigate(`/study/${opening.id}`)}
                  index={i}
                  focused={true}
                  onToggleFocus={(e) => handleToggleFocus(opening.id, e)}
                  compact
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Bookshelf */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex items-center gap-3 mb-4"
          >
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              {t("yourBookshelf")}
            </h2>
            <div className="flex-1 h-px bg-border/50" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookshelfOpenings.map((opening, i) => (
              <OpeningCard
                key={opening.id}
                opening={opening}
                onClick={() => navigate(`/study/${opening.id}`)}
                index={i}
                focused={false}
                onToggleFocus={(e) => handleToggleFocus(opening.id, e)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
