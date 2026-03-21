import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { openings } from "@/data/openingTrees";
import { themes } from "@/data/openings";
import { ArrowLeft, ChevronRight, Crown, Shield } from "lucide-react";

export default function StudyHub() {
  const { openingId } = useParams();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();

  const opening = openings.find((o) => o.id === openingId);

  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

  if (!opening) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Opening not found.</p>
      </div>
    );
  }

  const theme = themes[opening.themeId];
  const isWhiteOpening = opening.primarySide === "w";

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${theme.primaryColor}12, transparent 60%), radial-gradient(ellipse at 70% 100%, ${theme.accentColor}08, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 border-b border-border/30">
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
              {opening.family} Family
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Opening Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
            {opening.name}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {opening.description}
          </p>

          {/* Stats row */}
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
                <p className="text-xs text-muted-foreground">Played as</p>
                <p className="text-sm font-medium text-foreground">
                  {isWhiteOpening ? "White" : "Black"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Variations</p>
              <p className="text-sm font-medium text-foreground">{opening.variations.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total lines</p>
              <p className="text-sm font-medium text-foreground">{opening.totalVariations}</p>
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
            Study Modes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Play as primary side */}
            <motion.button
              whileHover={{ y: -2, boxShadow: `0 10px 30px -10px ${theme.primaryColor}40` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/study/${opening.id}/play?color=${opening.primarySide}`)}
              className="text-left rounded-xl p-5 border transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.accentColor}08)`,
                borderColor: `${theme.accentColor}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: theme.accentColor }}
                >
                  <Crown className="w-5 h-5" style={{ color: "hsl(var(--background))" }} />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground">
                    Play the {opening.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    As {isWhiteOpening ? "White" : "Black"} — learn the main ideas
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Play against */}
            <motion.button
              whileHover={{ y: -2, boxShadow: `0 10px 30px -10px ${theme.primaryColor}40` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/study/${opening.id}/play?color=${isWhiteOpening ? "b" : "w"}`)}
              className="text-left rounded-xl p-5 border transition-all duration-300"
              style={{
                background: "hsl(var(--card))",
                borderColor: "hsl(var(--border) / 0.5)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ borderColor: `${theme.accentColor}50` }}
                >
                  <Shield className="w-5 h-5" style={{ color: theme.accentColor }} />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground">
                    Play Against It
                  </p>
                  <p className="text-xs text-muted-foreground">
                    As {isWhiteOpening ? "Black" : "White"} — learn the best responses
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Variation Tree */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
            Variations to Study
          </h2>
          <div className="space-y-2">
            {opening.variations.map((variation, i) => (
              <motion.div
                key={variation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              >
                <motion.button
                  whileHover={{ x: 4, backgroundColor: `${theme.accentColor}10` }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/study/${opening.id}/play?color=${opening.primarySide}`)}
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
                          {variation.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                        {variation.description}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground/60 mt-1 pl-4">
                        {variation.startingMoves}
                      </p>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors flex-shrink-0 ml-3"
                    />
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
