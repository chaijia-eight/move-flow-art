import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Layers, Trash2, Play, Link2, Zap, Target, ShieldAlert, Crown as CrownIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

/** Classify a raw time_control string into a bucket */
function classifyTimeControl(tc: string | null): string {
  if (!tc) return "unknown";
  // Chess.com format: "300" or "300+5" or "1/86400"
  // Lichess format: "300+0" or "clock:initial=300:increment=0"
  const lower = tc.toLowerCase();
  if (lower.includes("1/") || lower.includes("daily") || lower.includes("correspondence")) return "daily";

  const parts = lower.replace(/clock:initial=/, "").replace(/:increment=/, "+").split("+");
  const base = parseInt(parts[0], 10);
  const inc = parseInt(parts[1] || "0", 10);
  const totalEstimate = base + inc * 40; // estimated game time in seconds

  if (isNaN(totalEstimate)) return "unknown";
  if (totalEstimate < 180) return "bullet";
  if (totalEstimate < 600) return "blitz";
  if (totalEstimate < 1800) return "rapid";
  return "classical";
}

export default function Decks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("auto");
  const [timeFilter, setTimeFilter] = useState("all");

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

  // Compute available time controls from games
  const availableTimeControls = React.useMemo(() => {
    if (!games) return new Set<string>();
    const set = new Set<string>();
    games.forEach((g) => set.add(classifyTimeControl(g.time_control)));
    return set;
  }, [games]);

  // Get filtered game IDs for the selected time control
  const filteredGameIds = React.useMemo(() => {
    if (!games) return null;
    if (timeFilter === "all") return null; // null = no filter
    return games
      .filter((g) => classifyTimeControl(g.time_control) === timeFilter)
      .map((g) => g.id);
  }, [games, timeFilter]);

  // Fetch positions, optionally filtered by game_id
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

  // Fetch manual repertoires (builds)
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
                <div className="flex items-center gap-2 mb-5 flex-wrap">
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

                {totalPositions === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-lg mb-2">
                      {unanalyzedCount > 0
                        ? `${gameCount} games synced — ${unanalyzedCount} awaiting analysis`
                        : `${gameCount} games synced — no critical positions found${timeFilter !== "all" ? " for this time control" : ""}`}
                    </p>
                    <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
                      {unanalyzedCount > 0
                        ? "Your games need to be analyzed by the engine to extract blunders, missed tactics, and other critical positions. This feature is coming soon."
                        : "Try syncing more games or changing the time control filter."}
                    </p>
                  </motion.div>
                ) : (
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
                            <Button size="sm" variant="outline" className="w-full gap-2">
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
