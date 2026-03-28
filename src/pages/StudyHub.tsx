import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { extractLinesForVariation, extractAllLines, type Line } from "@/lib/lineExtractor";
import { getLineProgress, isLineUnlocked, getOpeningProgress } from "@/lib/progressStore";
import { ArrowLeft, ChevronRight, Crown, Shield, ChevronDown, Lock, Check, BookOpen, RotateCcw, Shuffle, Flame, Pencil } from "lucide-react";
import { t, tn, tDesc, tVar } from "@/lib/i18n";
import UpgradeModal from "@/components/UpgradeModal";
import { useLineOverrides } from "@/hooks/useLineOverrides";

export default function StudyHub() {
  const { openingId } = useParams();
  const { user } = useAuth();
  const { canPractice, canLearnNewLine, canLearnTrap, isPro, lastTrapLearnedAt } = useSubscription();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();
  const { overrides, saveOverride } = useLineOverrides();
  const [showAgainstVariations, setShowAgainstVariations] = useState(false);
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"lines" | "practice">("lines");
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [editDescText, setEditDescText] = useState("");
  const isDev = user?.email === "xinya.vivian@me.com";

  const getDescOverride = useCallback((variationId: string, fallback: string) => {
    const key = `${variationId}/_desc`;
    return overrides[key]?.conclusion_text || tVar(variationId, "description", fallback);
  }, [overrides]);

  const handleSaveDesc = useCallback(async (variationId: string) => {
    await saveOverride({
      line_id: `${variationId}/_desc`,
      moves: null,
      crucial_moment_index: null,
      conclusion_text: editDescText.trim() || null,
    });
    setEditingDescId(null);
  }, [editDescText, saveOverride]);

  const opening = openings.find((o) => o.id === openingId);


  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

  const allLines = useMemo(() => {
    if (!opening) return [];
    return extractAllLines(opening);
  }, [opening]);

  const allLineIds = useMemo(() => allLines.map((l) => l.id), [allLines]);

  const linesByVariation = useMemo(() => {
    if (!opening) return new Map<string, Line[]>();
    const map = new Map<string, Line[]>();
    for (const v of opening.variations) {
      map.set(v.id, extractLinesForVariation(opening, v));
    }
    return map;
  }, [opening]);

  const [, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
  }, [openingId]);

  if (!opening) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("openingNotFound")}</p>
      </div>
    );
  }

  const theme = themes[opening.themeId];
  const isWhiteOpening = opening.primarySide === "w";
  const againstColor = isWhiteOpening ? "b" : "w";
  const progress = getOpeningProgress(allLineIds);
  const openingName = tn("openingName", opening.id);
  const familyName = tn("familyName", opening.family);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${theme.primaryColor}30, transparent 55%), radial-gradient(ellipse at 80% 100%, ${theme.accentColor}20, transparent 50%), radial-gradient(circle at 50% 50%, ${theme.primaryColor}08, transparent 70%)`,
        }}
      />

      <header className="relative z-10 px-6 py-5 border-b" style={{ borderColor: `${theme.accentColor}25` }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {familyName} {t("family")}
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ color: theme.accentColor }}>
            {openingName}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {tDesc(opening.id, opening.description)}
          </p>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.accentColor}20` }}
              >
                {isWhiteOpening ? (
                  <Crown className="w-4 h-4" style={{ color: theme.accentColor }} />
                ) : (
                  <Shield className="w-4 h-4" style={{ color: theme.accentColor }} />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("playedAs")}</p>
                <p className="text-sm font-medium text-foreground">
                  {isWhiteOpening ? t("white") : t("black")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("variationsLabel")}</p>
              <p className="text-sm font-medium text-foreground">{opening.variations.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("totalLines")}</p>
              <p className="text-sm font-medium text-foreground">{allLines.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("masteredLabel")}</p>
              <p className="text-sm font-medium text-foreground">
                {Math.round(progress * 100)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Study Modes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
            {t("studyModes")}
          </h2>

          {/* Play Against It — compact, above Practice */}
          <div className="mb-3">
            <motion.button
              whileHover={{ backgroundColor: `${theme.accentColor}12` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (opening.variations.length <= 1) {
                  navigate(`/study/${opening.id}/play?color=${againstColor}&against=1`);
                } else {
                  setShowAgainstVariations((v) => !v);
                }
              }}
              className="w-full text-left rounded-lg px-4 py-3 border transition-all duration-300 group"
              style={{
                background: "hsl(var(--card))",
                borderColor: showAgainstVariations ? `${theme.accentColor}40` : "hsl(var(--border) / 0.4)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" style={{ color: theme.accentColor }} />
                  <span className="text-sm font-medium text-foreground">
                    {t("playAgainstIt")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    — {isWhiteOpening ? t("asBlackChoose") : t("asWhiteChoose")}
                  </span>
                </div>
                {opening.variations.length > 1 && (
                  <motion.div
                    animate={{ rotate: showAgainstVariations ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                  </motion.div>
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {showAgainstVariations && opening.variations.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-1.5 pl-2 space-y-1">
                    {opening.variations.map((variation, i) => (
                      <motion.button
                        key={variation.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: i * 0.03 }}
                        whileHover={{ x: 4, backgroundColor: `${theme.accentColor}10` }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          navigate(`/study/${opening.id}/play?color=${againstColor}&variation=${variation.id}&against=1`)
                        }
                        className="w-full text-left rounded-lg px-3 py-2 border border-border/20 transition-all duration-200 group"
                        style={{ background: "hsl(var(--card))" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: theme.accentColor }}
                            />
                            <span className="text-sm text-foreground truncate">
                              {t("vs")} {tVar(variation.id, "name", variation.name)}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors flex-shrink-0 ml-2" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Practice — full width, prominent */}
          {(() => {
            const attemptedLines = allLines.filter(l => getLineProgress(l.id).attempts >= 1);
            const hasAttempted = attemptedLines.length > 0;
            return (
              <motion.button
                whileHover={hasAttempted ? { y: -2, boxShadow: `0 10px 30px -10px ${theme.primaryColor}40` } : {}}
                whileTap={hasAttempted ? { scale: 0.98 } : {}}
                disabled={!hasAttempted}
                onClick={() => {
                  if (!hasAttempted) return;
                  if (user && !canPractice) {
                    setUpgradeReason("practice");
                    setShowUpgradeModal(true);
                    return;
                  }
                  const randomLine = attemptedLines[Math.floor(Math.random() * attemptedLines.length)];
                  if (randomLine) {
                    const variation = opening.variations.find(v => v.id === randomLine.variationId);
                    if (variation) {
                      const lines = extractLinesForVariation(opening, variation);
                      const lineIdx = lines.findIndex(l => l.id === randomLine.id);
                      navigate(
                        `/study/${opening.id}/play?color=${opening.primarySide}&variation=${randomLine.variationId}&line=${lineIdx >= 0 ? lineIdx : 0}&practice=1`
                      );
                    }
                  }
                }}
                className={`w-full text-left rounded-xl p-5 border transition-all duration-300 ${!hasAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  background: hasAttempted
                    ? `linear-gradient(135deg, hsl(45, 100%, 50%, 0.1), hsl(45, 100%, 60%, 0.05))`
                    : `hsl(var(--muted))`,
                  borderColor: hasAttempted
                    ? `hsl(45, 100%, 50%, 0.3)`
                    : `hsl(var(--border))`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: hasAttempted ? "hsl(45, 100%, 50%)" : "hsl(var(--muted-foreground) / 0.3)" }}
                  >
                    <Shuffle className="w-5 h-5" style={{ color: hasAttempted ? "hsl(var(--background))" : "hsl(var(--muted-foreground))" }} />
                  </div>
                  <div>
                    <p className={`font-serif text-lg font-semibold ${hasAttempted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Practice
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasAttempted ? "Random line, play from memory" : "Fully learn a line first!"}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })()}
        </motion.div>

        {/* Variations & Lines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
            {t("linesToLearn")}
          </h2>
          <div className="space-y-3">
            {opening.variations.filter(v => !v.isTrap).map((variation, vi) => {
              const lines = linesByVariation.get(variation.id) || [];
              const masteredInVariation = lines.filter((l) => getLineProgress(l.id).mastered).length;
              const isExpanded = expandedVariation === variation.id;

              return (
                <motion.div
                  key={variation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + vi * 0.06 }}
                >
                  <motion.button
                    whileHover={{ backgroundColor: `${theme.accentColor}08` }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setExpandedVariation(isExpanded ? null : variation.id)}
                    className="w-full text-left rounded-xl p-4 border border-border/30 transition-all duration-300 group"
                    style={{ background: "hsl(var(--card))" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: theme.accentColor }}
                          />
                          <h3 className="font-serif text-base font-semibold text-foreground truncate">
                            {tVar(variation.id, "name", variation.name)}
                          </h3>
                          <span className="text-xs text-muted-foreground/60 font-mono ml-1">
                            {masteredInVariation}/{lines.length} {t("linesCount")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 pl-4">
                          {editingDescId === variation.id ? (
                            <div className="flex-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editDescText}
                                onChange={(e) => setEditDescText(e.target.value)}
                                className="flex-1 text-sm rounded px-2 py-1"
                                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                                autoFocus
                                onKeyDown={(e) => { if (e.key === "Enter") handleSaveDesc(variation.id); if (e.key === "Escape") setEditingDescId(null); }}
                              />
                              <button onClick={() => handleSaveDesc(variation.id)} className="text-xs px-2 py-1 rounded" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>Save</button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                                {getDescOverride(variation.id, variation.description)}
                              </p>
                              {isDev && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingDescId(variation.id); setEditDescText(getDescOverride(variation.id, variation.description)); }}
                                  className="p-1 rounded opacity-40 hover:opacity-100 flex-shrink-0"
                                >
                                  <Pencil size={12} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${lines.length > 0 ? (masteredInVariation / lines.length) * 100 : 0}%`,
                              background: theme.accentColor,
                            }}
                          />
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1.5 pl-4 space-y-1">
                          {lines.map((line, li) => {
                            const prog = getLineProgress(line.id);
                            const variationLineIds = lines.map((l) => l.id);
                            const unlocked = isLineUnlocked(line.id, variationLineIds);
                            const isMastered = prog.mastered;

                            return (
                              <motion.button
                                key={line.id}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15, delay: li * 0.03 }}
                                whileHover={unlocked ? { x: 4, backgroundColor: `${theme.accentColor}10` } : {}}
                                whileTap={unlocked ? { scale: 0.98 } : {}}
                                onClick={() => {
                                  if (!unlocked) return;
                                  navigate(
                                    `/study/${opening.id}/play?color=${opening.primarySide}&variation=${variation.id}&line=${li}`
                                  );
                                }}
                                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all duration-200 group ${
                                  !unlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                                style={{
                                  background: isMastered
                                    ? `${theme.accentColor}08`
                                    : "hsl(var(--card))",
                                  borderColor: isMastered
                                    ? `${theme.accentColor}30`
                                    : "hsl(var(--border) / 0.3)",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {!unlocked ? (
                                      <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                                    ) : isMastered ? (
                                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.accentColor }} />
                                    ) : (
                                      <div
                                        className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                                        style={{ borderColor: `${theme.accentColor}40` }}
                                      />
                                    )}
                                    <span className={`text-sm truncate ${isMastered ? "font-medium" : ""}`}
                                      style={{ color: isMastered ? theme.accentColor : undefined }}
                                    >
                                      {line.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    {prog.correctAttempts > 0 && !isMastered && (
                                      <span className="text-[10px] text-muted-foreground/60 font-mono">
                                        {prog.correctAttempts}× {t("correct")}
                                      </span>
                                    )}
                                    {isMastered && (
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/study/${opening.id}/play?color=${opening.primarySide}&variation=${variation.id}&line=${li}&review=1`
                                          );
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1 rounded hover:bg-accent/50 transition-colors"
                                        title={t("reviewMode")}
                                      >
                                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground/50" />
                                      </motion.button>
                                    )}
                                    {unlocked && (
                                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                                    )}
                                  </div>
                                </div>
                                {line.crucialMoment ? (
                                  <p className="text-[11px] mt-0.5 pl-5.5 truncate" style={{ color: `${theme.accentColor}cc` }}>
                                    <span className="font-medium">
                                      {line.crucialMoment.isPlayerMove ? "⚡" : "🛡️"}
                                    </span>
                                    {" "}{line.crucialMoment.description}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 pl-5.5 font-mono truncate">
                                    {line.moves.join(" ")}
                                  </p>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Crushing Lines / Traps */}
        {(() => {
          const trapVariations = opening.variations.filter(v => v.isTrap);
          if (trapVariations.length === 0) return null;

          const daysUntilNextTrap = !canLearnTrap && lastTrapLearnedAt
            ? Math.max(0, Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(lastTrapLearnedAt).getTime())) / (24 * 60 * 60 * 1000)))
            : 0;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  {t("secretTraps")}
                </h2>
                {!isPro && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
                  >
                    {t("onePerWeek")}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {trapVariations.map((variation, ti) => {
                  const lines = linesByVariation.get(variation.id) || [];
                  const trapLocked = !isPro && !canLearnTrap;

                  return (
                    <motion.div
                      key={variation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + ti * 0.06 }}
                    >
                      <motion.button
                        whileHover={!trapLocked ? { backgroundColor: "hsl(25 100% 50% / 0.08)" } : {}}
                        whileTap={!trapLocked ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (trapLocked) {
                            setUpgradeReason("lines");
                            setShowUpgradeModal(true);
                            return;
                          }
                          if (lines.length > 0) {
                            navigate(
                              `/study/${opening.id}/play?color=${opening.primarySide}&variation=${variation.id}&line=0`
                            );
                          }
                        }}
                        className={`w-full text-left rounded-xl p-4 border transition-all duration-300 group ${trapLocked ? 'opacity-60' : ''}`}
                        style={{
                          background: "hsl(var(--card))",
                          borderColor: trapLocked ? "hsl(var(--border) / 0.3)" : "hsl(25 100% 50% / 0.3)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              {trapLocked && (
                                <span className="text-[10px] text-muted-foreground/60 font-mono ml-1">
                                  {daysUntilNextTrap}d left
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-6 line-clamp-2">
                              {tVar(variation.id, "description", variation.description)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {trapLocked ? (
                              <Lock className="w-4 h-4 text-muted-foreground/40" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-orange-500/60 group-hover:text-orange-500 transition-colors" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </div>
  );
}
