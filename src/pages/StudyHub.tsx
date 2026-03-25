import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { extractLinesForVariation, extractAllLines, type Line } from "@/lib/lineExtractor";
import { getLineProgress, isLineUnlocked, getOpeningProgress } from "@/lib/progressStore";
import { ArrowLeft, ChevronRight, Crown, Shield, ChevronDown, Lock, Check, BookOpen, RotateCcw, Shuffle } from "lucide-react";
import { t, tn, tDesc, tVar } from "@/lib/i18n";

export default function StudyHub() {
  const { openingId } = useParams();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();
  const [showAgainstVariations, setShowAgainstVariations] = useState(false);
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Practice button */}
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
                  className={`text-left rounded-xl p-5 border transition-all duration-300 ${!hasAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: hasAttempted
                      ? `linear-gradient(135deg, hsl(45, 100%, 50%, 0.1), hsl(45, 100%, 60%, 0.05))`
                      : `hsl(var(--muted))`,
                    borderColor: hasAttempted
                      ? `hsl(45, 100%, 50%, 0.3)`
                      : `hsl(var(--border))`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
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
            <div className="flex flex-col">
              <motion.button
                whileHover={{ y: -2, boxShadow: `0 10px 30px -10px ${theme.primaryColor}40` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (opening.variations.length <= 1) {
                    navigate(`/study/${opening.id}/play?color=${againstColor}`);
                  } else {
                    setShowAgainstVariations((v) => !v);
                  }
                }}
                className="text-left rounded-xl p-5 border transition-all duration-300"
                style={{
                  background: "hsl(var(--card))",
                  borderColor: showAgainstVariations ? `${theme.accentColor}50` : "hsl(var(--border) / 0.5)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{ borderColor: `${theme.accentColor}50` }}
                  >
                    <Shield className="w-5 h-5" style={{ color: theme.accentColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-lg font-semibold text-foreground">
                      {t("playAgainstIt")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isWhiteOpening ? t("asBlackChoose") : t("asWhiteChoose")}
                    </p>
                  </div>
                  {opening.variations.length > 1 && (
                    <motion.div
                      animate={{ rotate: showAgainstVariations ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
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
                    <div className="pt-2 space-y-1.5">
                      {opening.variations.map((variation, i) => (
                        <motion.button
                          key={variation.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          whileHover={{ x: 4, backgroundColor: `${theme.accentColor}12` }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            navigate(`/study/${opening.id}/play?color=${againstColor}&variation=${variation.id}`)
                          }
                          className="w-full text-left rounded-lg p-3 border border-border/30 transition-all duration-200 group"
                          style={{ background: "hsl(var(--card))" }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: theme.accentColor }}
                              />
                              <span className="text-sm font-medium text-foreground truncate">
                                {t("vs")} {tVar(variation.id, "name", variation.name)}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors flex-shrink-0 ml-2" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 pl-3.5 line-clamp-1">
                            {tVar(variation.id, "description", variation.description)}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
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
            {opening.variations.map((variation, vi) => {
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
                        <p className="text-sm text-muted-foreground leading-relaxed pl-4 line-clamp-1">
                          {tVar(variation.id, "description", variation.description)}
                        </p>
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

      </div>
    </div>
  );
}
