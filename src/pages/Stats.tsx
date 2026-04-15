import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Swords, Target, ShieldAlert, Zap, TrendingUp, Calendar, Gamepad2, Link2, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EloRatings {
  platform: string;
  rapid?: number;
  blitz?: number;
  bullet?: number;
  classical?: number;
  daily?: number;
}

export default function Stats() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: gameStats } = useQuery({
    queryKey: ["game-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: games, error } = await supabase
        .from("user_games")
        .select("result, platform, played_at")
        .eq("user_id", user!.id);
      if (error) throw error;

      const total = games.length;
      const wins = games.filter((g) => g.result === "win").length;
      const losses = games.filter((g) => g.result === "loss").length;
      const draws = total - wins - losses;
      const byPlatform: Record<string, number> = {};
      games.forEach((g) => {
        byPlatform[g.platform] = (byPlatform[g.platform] || 0) + 1;
      });

      // Games per day (last 14 days)
      const now = new Date();
      const dailyCounts: { date: string; count: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const count = games.filter(
          (g) => g.played_at && g.played_at.slice(0, 10) === dateStr
        ).length;
        dailyCounts.push({ date: dateStr, count });
      }

      return { total, wins, losses, draws, byPlatform, dailyCounts };
    },
  });

  const { data: positionStats } = useQuery({
    queryKey: ["position-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const categories = ["blunder", "missed_tactic", "defensive_crux", "endgame_tech"];
      const counts: Record<string, number> = {};
      for (const cat of categories) {
        const { count } = await supabase
          .from("user_positions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("category", cat);
        counts[cat] = count ?? 0;
      }
      return counts;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["user-profile-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: eloRatings } = useQuery({
    queryKey: ["elo-ratings", profile?.chesscom_username, profile?.lichess_username],
    enabled: !!(profile?.chesscom_username || profile?.lichess_username),
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<EloRatings[]> => {
      const ratings: EloRatings[] = [];

      if (profile?.chesscom_username) {
        try {
          const res = await fetch(`https://api.chess.com/pub/player/${profile.chesscom_username}/stats`);
          if (res.ok) {
            const data = await res.json();
            ratings.push({
              platform: "Chess.com",
              rapid: data.chess_rapid?.last?.rating,
              blitz: data.chess_blitz?.last?.rating,
              bullet: data.chess_bullet?.last?.rating,
              daily: data.chess_daily?.last?.rating,
            });
          }
        } catch { /* ignore */ }
      }

      if (profile?.lichess_username) {
        try {
          const res = await fetch(`https://lichess.org/api/user/${profile.lichess_username}`);
          if (res.ok) {
            const data = await res.json();
            const perfs = data.perfs || {};
            ratings.push({
              platform: "Lichess",
              rapid: perfs.rapid?.rating,
              blitz: perfs.blitz?.rating,
              bullet: perfs.bullet?.rating,
              classical: perfs.classical?.rating,
            });
          }
        } catch { /* ignore */ }
      }

      return ratings;
    },
  });

  const hasGames = (gameStats?.total ?? 0) > 0;
  const totalPositions = positionStats
    ? Object.values(positionStats).reduce((a, b) => a + b, 0)
    : 0;

  const maxDaily = gameStats
    ? Math.max(...gameStats.dailyCounts.map((d) => d.count), 1)
    : 1;

  const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    blunder: { label: "Blunders", icon: ShieldAlert, color: "text-red-400" },
    missed_tactic: { label: "Missed Tactics", icon: Target, color: "text-amber-400" },
    defensive_crux: { label: "Defensive Drills", icon: Zap, color: "text-blue-400" },
    endgame_tech: { label: "Endgame Technique", icon: TrendingUp, color: "text-emerald-400" },
  };

  if (!hasGames) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-8">Your Stats</h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg mb-2">No data yet</p>
            <p className="text-muted-foreground/70 text-sm mb-6">
              Connect your Chess.com or Lichess account and sync your games to see stats.
            </p>
            <Button variant="outline" onClick={() => navigate("/connect")} className="gap-2">
              <Link2 className="w-4 h-4" /> Connect Account
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">Your Stats</h1>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Games", value: gameStats?.total ?? 0, icon: Gamepad2 },
            { label: "Wins", value: gameStats?.wins ?? 0, icon: Swords },
            { label: "Win Rate", value: gameStats ? `${Math.round((gameStats.wins / gameStats.total) * 100)}%` : "—", icon: TrendingUp },
            { label: "Positions Found", value: totalPositions, icon: Target },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <card.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Elo Ratings */}
        {eloRatings && eloRatings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" /> Ratings
            </h2>
            <div className="space-y-4">
              {eloRatings.map((r) => (
                <div key={r.platform}>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{r.platform}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      ["Rapid", r.rapid],
                      ["Blitz", r.blitz],
                      ["Bullet", r.bullet],
                      ...(r.classical ? [["Classical", r.classical]] : []),
                      ...(r.daily ? [["Daily", r.daily]] : []),
                    ] as [string, number | undefined][]).filter(([, v]) => v != null).map(([label, value]) => (
                      <div key={label} className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-xl font-bold text-foreground">{value}</p>
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Win/Loss/Draw bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">Results Breakdown</h2>
          <div className="flex h-6 rounded-full overflow-hidden bg-muted">
            {gameStats && gameStats.total > 0 && (
              <>
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(gameStats.wins / gameStats.total) * 100}%` }}
                />
                <div
                  className="bg-muted-foreground/30 transition-all"
                  style={{ width: `${(gameStats.draws / gameStats.total) * 100}%` }}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(gameStats.losses / gameStats.total) * 100}%` }}
                />
              </>
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {gameStats?.wins ?? 0} Wins
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
              {gameStats?.draws ?? 0} Draws
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              {gameStats?.losses ?? 0} Losses
            </span>
          </div>
        </motion.div>

        {/* Activity chart (last 14 days) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Games — Last 14 Days
          </h2>
          <div className="flex items-end gap-1 h-24">
            {gameStats?.dailyCounts.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t bg-primary/80 transition-all min-h-[2px]"
                  style={{ height: `${(d.count / maxDaily) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{gameStats?.dailyCounts[0]?.date.slice(5)}</span>
            <span>{gameStats?.dailyCounts[13]?.date.slice(5)}</span>
          </div>
        </motion.div>

        {/* Position categories */}
        {totalPositions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Critical Positions by Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const count = positionStats?.[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <meta.icon className={`w-5 h-5 ${meta.color}`} />
                    <div>
                      <p className="text-lg font-bold text-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground">{meta.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Platform breakdown */}
        {gameStats && Object.keys(gameStats.byPlatform).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Games by Platform</h2>
            <div className="space-y-2">
              {Object.entries(gameStats.byPlatform).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">{platform}</span>
                  <span className="text-sm font-medium text-muted-foreground">{count} games</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
