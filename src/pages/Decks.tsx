import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Layers, Trash2, Play, Link2, Zap, Target,
  ShieldAlert, Crown as CrownIcon, Filter, Cpu, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeGame, getPlayerColor, type AnalysisPosition } from "@/lib/gameAnalyzer";
import { destroyEngine } from "@/lib/stockfishEngine";
import type { OpeningNode } from "@/data/openings";

function countLines(nodes: OpeningNode[]): number {
  if (nodes.length === 0) return 0;
  let total = 0;
  for (const node of nodes) {
    if ((node.children ?? []).length === 0) total += 1;
    else total += countLines(node.children);
  }
  return total;
}

type Tab = "auto" | "manual";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  blunder: { label: "Blunders", icon: ShieldAlert, color: "text-red-400" },
  missed_tactic: { label: "Missed Tactics", icon: Target, color: "text-amber-400" },
  defensive_crux: { label: "Defensive Drills", icon: Zap, color: "text-blue-400" },
  endgame_tech: { label: "Endgame Technique", icon: CrownIcon, color: "text-emerald-400" },
};

const TIME_CONTROL_FILTERS = [
  { value: "all", label: "All" },
  { value: "bullet", label: "Bullet" },
  { value: "blitz", label: "Blitz" },
  { value: "rapid", label: "Rapid" },
  { value: "classical", label: "Classical" },
  { value: "daily", label: "Daily" },
];

function classifyTimeControl(tc: string | null): string {
  if (!tc) return "unknown";
  const lower = tc.toLowerCase();
  if (lower.includes("1/") || lower.includes("daily") || lower.includes("correspondence")) return "daily";
  const parts = lower.replace(/clock:initial=/, "").replace(/:increment=/, "+").split("+");
  const base = parseInt(parts[0], 10);
  const inc = parseInt(parts[1] || "0", 10);
  const totalEstimate = base + inc * 40;
  if (isNaN(totalEstimate)) return "unknown";
  if (totalEstimate < 180) return "bullet";
  if (totalEstimate < 600) return "blitz";
  if (totalEstimate < 1800) return "rapid";
  return "classical";
}

interface AnalysisState {
  running: boolean;
  gameIndex: number;
  totalGames: number;
  moveIndex: number;
  totalMoves: number;
  opponent: string;
  positionsFound: number;
}

export default function Decks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("auto");
  const [timeFilter, setTimeFilter] = useState("all");
  const [analysis, setAnalysis] = useState<AnalysisState>({
    running: false, gameIndex: 0, totalGames: 0,
    moveIndex: 0, totalMoves: 0, opponent: "", positionsFound: 0,
  });

  // Fetch all games with time_control info for filtering
  const { data: games } = useQuery({
    queryKey: ["all-games-tc", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_games")
        .select("id, time_control, analyzed")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const gameCount = games?.length ?? 0;
  const hasGames = gameCount > 0;

  const availableTimeControls = React.useMemo(() => {
    if (!games) return new Set<string>();
    const set = new Set<string>();
    games.forEach((g) => set.add(classifyTimeControl(g.time_control)));
    return set;
  }, [games]);

  const filteredGameIds = React.useMemo(() => {
    if (!games) return null;
    if (timeFilter === "all") return null;
    return games
      .filter((g) => classifyTimeControl(g.time_control) === timeFilter)
      .map((g) => g.id);
  }, [games, timeFilter]);

  const { data: positionCounts } = useQuery({
    queryKey: ["position-counts", user?.id, timeFilter, filteredGameIds],
    enabled: !!user,
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const cat of Object.keys(CATEGORY_META)) {
        let query = supabase
          .from("user_positions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("category", cat);
        if (filteredGameIds) {
          query = query.in("game_id", filteredGameIds);
        }
        const { count } = await query;
        counts[cat] = count ?? 0;
      }
      return counts;
    },
  });

  const { data: repertoires } = useQuery({
    queryKey: ["user-repertoires", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_repertoires")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteRepertoire = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this deck?")) return;
    await supabase.from("user_repertoires").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["user-repertoires", user?.id] });
  };

  const totalPositions = positionCounts
    ? Object.values(positionCounts).reduce((a, b) => a + b, 0)
    : 0;

  const analyzedCount = games?.filter((g) => g.analyzed).length ?? 0;
  const unanalyzedCount = gameCount - analyzedCount;

  // ---------- ANALYSIS PIPELINE ----------
  const runAnalysis = useCallback(async () => {
    if (!user || analysis.running) return;

    // Fetch unanalyzed games with PGNs
    const { data: unanalyzedGames, error } = await supabase
      .from("user_games")
      .select("id, pgn, opponent, platform")
      .eq("user_id", user.id)
      .eq("analyzed", false)
      .not("pgn", "is", null);

    if (error || !unanalyzedGames || unanalyzedGames.length === 0) return;

    // Get username for determining player color
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("chesscom_username, lichess_username")
      .eq("user_id", user.id)
      .maybeSingle();

    setAnalysis({
      running: true, gameIndex: 0, totalGames: unanalyzedGames.length,
      moveIndex: 0, totalMoves: 0, opponent: "", positionsFound: 0,
    });

    let totalFound = 0;

    for (let gi = 0; gi < unanalyzedGames.length; gi++) {
      const game = unanalyzedGames[gi];
      if (!game.pgn) continue;

      const username =
        game.platform === "chesscom"
          ? profile?.chesscom_username || ""
          : profile?.lichess_username || "";

      const playerColor = getPlayerColor(game.pgn, username);

      setAnalysis((prev) => ({
        ...prev,
        gameIndex: gi,
        opponent: game.opponent || `Game ${gi + 1}`,
        moveIndex: 0,
        totalMoves: 0,
      }));

      try {
        const positions = await analyzeGame(
          game.pgn,
          playerColor,
          (moveIdx, totalMoves) => {
            setAnalysis((prev) => ({ ...prev, moveIndex: moveIdx, totalMoves }));
          },
        );

        // Save positions to DB
        if (positions.length > 0) {
          const rows = positions.map((p) => ({
            user_id: user.id,
            game_id: game.id,
            fen: p.fen,
            category: p.category,
            move_number: p.move_number,
            your_move_san: p.your_move_san,
            engine_best_san: p.engine_best_san,
            eval_before: p.eval_before,
            eval_after: p.eval_after,
            difficulty_score: p.difficulty_score,
          }));

          await supabase.from("user_positions").insert(rows);
          totalFound += positions.length;
          setAnalysis((prev) => ({ ...prev, positionsFound: totalFound }));
        }

        // Mark game as analyzed
        await supabase
          .from("user_games")
          .update({ analyzed: true })
          .eq("id", game.id);
      } catch (err) {
        console.error(`Analysis failed for game ${game.id}:`, err);
      }
    }

    // Cleanup
    destroyEngine();
    setAnalysis((prev) => ({ ...prev, running: false }));

    // Refresh data
    queryClient.invalidateQueries({ queryKey: ["position-counts"] });
    queryClient.invalidateQueries({ queryKey: ["all-games-tc"] });
    queryClient.invalidateQueries({ queryKey: ["position-stats"] });
    queryClient.invalidateQueries({ queryKey: ["game-stats"] });
  }, [user, analysis.running, queryClient]);

  const analysisPercent = analysis.totalGames > 0
    ? Math.round(((analysis.gameIndex + (analysis.totalMoves > 0 ? analysis.moveIndex / analysis.totalMoves : 0)) / analysis.totalGames) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground">Your Decks</h1>
          <Button onClick={() => navigate("/decks/build")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setTab("auto")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "auto"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            From Games {hasGames && totalPositions > 0 && (
              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {totalPositions}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "manual"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Builds {repertoires && repertoires.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {repertoires.length}
              </span>
            )}
          </button>
        </div>

        {/* Analysis progress banner */}
        <AnimatePresence>
          {analysis.running && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Analyzing: vs {analysis.opponent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Game {analysis.gameIndex + 1} of {analysis.totalGames}
                    {analysis.totalMoves > 0 && ` · Move ${Math.floor(analysis.moveIndex / 2) + 1}`}
                    {" · "}{analysis.positionsFound} positions found
                  </p>
                </div>
              </div>
              <Progress value={analysisPercent} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto tab */}
        {tab === "auto" && (
          <>
            {!hasGames ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg mb-2">No games imported yet</p>
                <p className="text-muted-foreground/70 text-sm mb-6">
                  Connect your Chess.com or Lichess account to auto-generate drill decks.
                </p>
                <Button variant="outline" onClick={() => navigate("/connect")} className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Account
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Time control filter */}
                <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    {TIME_CONTROL_FILTERS.map((f) => {
                      const disabled = f.value !== "all" && !availableTimeControls.has(f.value);
                      return (
                        <button
                          key={f.value}
                          onClick={() => !disabled && setTimeFilter(f.value)}
                          disabled={disabled}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            timeFilter === f.value
                              ? "bg-primary text-primary-foreground"
                              : disabled
                              ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  {unanalyzedCount > 0 && !analysis.running && (
                    <Button
                      size="sm"
                      onClick={runAnalysis}
                      className="gap-2"
                    >
                      <Cpu className="w-4 h-4" />
                      Analyze {unanalyzedCount} Game{unanalyzedCount !== 1 ? "s" : ""}
                    </Button>
                  )}
                </div>

                {totalPositions === 0 && !analysis.running ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <Cpu className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-lg mb-2">
                      {unanalyzedCount > 0
                        ? `${gameCount} games synced — ${unanalyzedCount} ready to analyze`
                        : `${gameCount} games analyzed — no critical positions found${timeFilter !== "all" ? " for this time control" : ""}`}
                    </p>
                    <p className="text-muted-foreground/70 text-sm max-w-md mx-auto mb-6">
                      {unanalyzedCount > 0
                        ? "Run the engine analysis to scan your games for blunders, missed tactics, and key defensive moments."
                        : "Try syncing more games or changing the time control filter."}
                    </p>
                    {unanalyzedCount > 0 && (
                      <Button onClick={runAnalysis} className="gap-2">
                        <Cpu className="w-4 h-4" />
                        Start Analysis
                      </Button>
                    )}
                  </motion.div>
                ) : !analysis.running && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(CATEGORY_META).map(([cat, meta], i) => {
                      const count = positionCounts?.[cat] ?? 0;
                      if (count === 0) return null;
                      const Icon = meta.icon;

                      return (
                        <motion.div
                          key={cat}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          whileHover={{ y: -4, boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)" }}
                          className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer"
                        >
                          <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${meta.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-serif text-lg font-semibold text-foreground">
                                  {meta.label}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                  {count} position{count !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => navigate(`/decks/drill/${cat}`)}>
                              <Play className="w-3.5 h-3.5" />
                              Drill Now
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Manual tab */}
        {tab === "manual" && (
          <>
            {(!repertoires || repertoires.length === 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg mb-2">No manual decks yet</p>
                <p className="text-muted-foreground/70 text-sm mb-6">
                  Build your own drill deck from positions, PGNs, or FENs.
                </p>
                <Button onClick={() => navigate("/decks/build")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Deck
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {repertoires.map((rep, i) => {
                  const tree = (rep.tree || []) as unknown as OpeningNode[];
                  const lineCount = countLines(tree);
                  const isWhite = rep.side === "w";

                  return (
                    <motion.div
                      key={rep.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4, boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.2)" }}
                      className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer"
                      onClick={() => navigate(`/decks/build/${rep.id}`)}
                    >
                      <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold text-foreground truncate mb-1">
                          {rep.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
                          {isWhite ? "White" : "Black"} · {lineCount} line{lineCount !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground gap-1 h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/decks/study/${rep.id}`);
                            }}
                          >
                            <Play className="w-3.5 h-3.5" />
                            Study
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={(e) => handleDeleteRepertoire(e, rep.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
