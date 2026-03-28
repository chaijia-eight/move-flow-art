import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Trophy, BookOpen, Target, Star, Crown, Zap, ChevronDown, Shuffle, Leaf, ChevronRight } from "lucide-react";
import OpeningCard from "@/components/OpeningCard";
import LearningPath from "@/components/LearningPath";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import type { OpeningNode } from "@/data/openings";
import { extractAllLines, extractLinesForVariation } from "@/lib/lineExtractor";
import { getLineProgress, getOpeningProgress } from "@/lib/progressStore";
import { getFocusedOpenings, toggleFocus } from "@/lib/focusStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubscription, FREE_DAILY_LINES, FREE_DAILY_PRACTICES } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { t, tf, tn } from "@/lib/i18n";

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

/** Find the non-100% opening with the most progress (attempts) */
function getBestTreeOpening(): { opening: typeof openings[0]; progress: number; totalAttempts: number } | null {
  let best: { opening: typeof openings[0]; progress: number; totalAttempts: number } | null = null;

  for (const opening of openings) {
    const allLines = extractAllLines(opening);
    const lineIds = allLines.map((l) => l.id);
    const prog = getOpeningProgress(lineIds);
    if (prog >= 1) continue;

    let attempts = 0;
    for (const line of allLines) {
      attempts += getLineProgress(line.id).attempts;
    }

    if (attempts > 0 && (!best || attempts > best.totalAttempts)) {
      best = { opening, progress: prog, totalAttempts: attempts };
    }
  }

  return best;
}

export default function Index() {
  const { user } = useAuth();
  const { isPro, dailyLinesUsed, dailyPracticesUsed, canLearnNewLine, canPractice, startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [focusedIds, setFocusedIds] = useState(getFocusedOpenings);

  // Fetch user's garden studies
  const { data: gardenStudies } = useQuery({
    queryKey: ["user-repertoires-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_repertoires")
        .select("id, name, side, tree")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

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

  // Tree shortcut: best non-100% opening with most progress
  const defaultTreeOpening = useMemo(() => getBestTreeOpening(), []);
  const [selectedTreeOpeningId, setSelectedTreeOpeningId] = useState<string | null>(null);
  const [showTreeSelector, setShowTreeSelector] = useState(false);

  const treeOpening = useMemo(() => {
    if (selectedTreeOpeningId) {
      const o = openings.find(op => op.id === selectedTreeOpeningId);
      if (o) return o;
    }
    return defaultTreeOpening?.opening || null;
  }, [selectedTreeOpeningId, defaultTreeOpening]);

  const treeSections = useMemo(() => {
    if (!treeOpening) return [];
    return treeOpening.variations.map(v => {
      const lines = extractLinesForVariation(treeOpening, v);
      return {
        variation: v,
        lines: v.isTrap ? lines.slice(0, 1) : lines,
      };
    });
  }, [treeOpening]);

  const treeTheme = treeOpening ? themes[treeOpening.themeId] : null;

  // Practice shortcut for tree opening
  const treePracticeLines = useMemo(() => {
    if (!treeOpening) return [];
    const allLines = extractAllLines(treeOpening);
    return allLines.filter(l => getLineProgress(l.id).attempts >= 1);
  }, [treeOpening]);

  const recTheme = recommendation ? themes[recommendation.themeId] : null;

  return (
    <div className="min-h-screen flex">
      {/* Left column: Your Focus */}
      <div className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border p-4 pt-10 sticky top-0 h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Your Focus
            </h2>
          </div>

          {focusedOpenings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Click the <Star className="w-3 h-3 inline -mt-0.5" /> on any opening to pin it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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

          {/* Stats below focus */}
          <div className="mt-8">
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
              {t("progress")}
            </h2>
            <div className="space-y-2.5">
              {[
                { label: t("linesMastered"), value: `${stats.masteredLines}/${stats.totalLines}`, icon: Trophy },
                { label: t("openingsStarted"), value: `${stats.openingsStarted}/${stats.totalOpenings}`, icon: BookOpen },
                { label: t("totalAttempts"), value: String(stats.totalAttempts), icon: Target },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Center content */}
      <div className="flex-1 min-w-0 px-6 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              ArcChess
            </h1>
            {isPro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("appTagline")}
          </p>
        </motion.div>

        <div className="max-w-2xl space-y-8">
          {/* Recommendation */}
          <section>
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

          {/* Daily Limits & Upgrade */}
          {user && !isPro && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
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
                        {dailyPracticesUsed}/{FREE_DAILY_PRACTICES}
                      </span>
                    </div>
                    <Progress value={(dailyPracticesUsed / FREE_DAILY_PRACTICES) * 100} className="h-1.5" />
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

          {/* Your Studies (Garden) */}
          {user && gardenStudies && gardenStudies.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-primary" />
                  <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                    Your Studies
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/garden")}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gardenStudies.map((rep, i) => {
                  const tree = (rep.tree || []) as unknown as OpeningNode[];
                  const lineCount = tree.length > 0 ? countGardenLines(tree) : 0;
                  return (
                    <motion.button
                      key={rep.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.03 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/garden/build/${rep.id}`)}
                      className="text-left rounded-lg px-3 py-2.5 border border-border/30 bg-card hover:bg-accent/30 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Leaf className="w-3 h-3 text-primary/60 shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">{rep.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {rep.side === "w" ? "W" : "B"} · {lineCount}L
                          </span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-foreground/50" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}


          <motion.section
            className="lg:hidden"
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
                  Click the <Star className="w-3.5 h-3.5 inline -mt-0.5" /> on any opening card to add it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {focusedOpenings.map((opening, i) => (
                  <OpeningCard
                    key={opening.id}
                    opening={opening}
                    onClick={() => navigate(`/study/${opening.id}`)}
                    index={i}
                    focused={true}
                    onToggleFocus={(e) => handleToggleFocus(opening.id, e)}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>

      {/* Right sidebar: Opening Tree Shortcut */}
      <aside className="w-[220px] border-l border-border shrink-0 p-4 pt-10 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col h-full"
        >
          {treeOpening && treeTheme ? (
            <>
              {/* Opening selector */}
              <div className="relative mb-3">
                <button
                  onClick={() => setShowTreeSelector(s => !s)}
                  className="w-full text-left rounded-lg border border-border bg-card p-2.5 flex items-center justify-between gap-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Tree</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tn("openingName", treeOpening.id)}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 shrink-0 transition-transform ${showTreeSelector ? "rotate-180" : ""}`} />
                </button>

                {showTreeSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg border border-border bg-card shadow-lg max-h-[300px] overflow-y-auto">
                    {openings
                      .filter(o => {
                        const lines = extractAllLines(o);
                        const prog = getOpeningProgress(lines.map(l => l.id));
                        return prog < 1 && lines.some(l => getLineProgress(l.id).attempts > 0);
                      })
                      .map(o => (
                        <button
                          key={o.id}
                          onClick={() => { setSelectedTreeOpeningId(o.id); setShowTreeSelector(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2 ${o.id === treeOpening.id ? "bg-accent/30" : ""}`}
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: themes[o.themeId].accentColor }}
                          />
                          <span className="truncate text-foreground">{tn("openingName", o.id)}</span>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getOpeningProgress(extractAllLines(treeOpening).map(l => l.id)) * 100)}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${getOpeningProgress(extractAllLines(treeOpening).map(l => l.id)) * 100}%`,
                      background: treeTheme.accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Practice shortcut — shiny yellow */}
              {treePracticeLines.length > 0 && (
                <button
                  className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(45, 100%, 50%, 0.15), hsl(45, 100%, 60%, 0.08))",
                    border: "1px solid hsl(45, 100%, 50%, 0.35)",
                    color: "hsl(45, 100%, 50%)",
                  }}
                  onClick={() => {
                    const randomLine = treePracticeLines[Math.floor(Math.random() * treePracticeLines.length)];
                    const variation = treeOpening.variations.find(v => v.id === randomLine.variationId);
                    if (variation) {
                      const lines = extractLinesForVariation(treeOpening, variation);
                      const lineIdx = lines.findIndex(l => l.id === randomLine.id);
                      navigate(
                        `/study/${treeOpening.id}/play?color=${treeOpening.primarySide}&variation=${randomLine.variationId}&line=${lineIdx >= 0 ? lineIdx : 0}&practice=1`
                      );
                    }
                  }}
                >
                  <Shuffle className="w-4 h-4" />
                  Practice
                </button>
              )}

              {/* Learning path tree */}
              <div className="flex-1 overflow-y-auto -mx-2 scrollbar-thin">
                <LearningPath
                  sections={treeSections}
                  theme={treeTheme}
                  openingId={treeOpening.id}
                  primarySide={treeOpening.primarySide}
                  onNavigate={(variationId, lineIndex) => {
                    navigate(
                      `/study/${treeOpening.id}/play?color=${treeOpening.primarySide}&variation=${variationId}&line=${lineIndex}`
                    );
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                Start learning an opening to see your tree here.
              </p>
            </div>
          )}
        </motion.div>
      </aside>
    </div>
  );
}
