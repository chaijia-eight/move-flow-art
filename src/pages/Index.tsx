import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Map, Eye, Link2, ArrowRight, Swords, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.email?.split("@")[0] || "there";

  const { data: profile } = useQuery({
    queryKey: ["user-profile-home", user?.id],
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

  const { data: gameStats } = useQuery({
    queryKey: ["home-game-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: games } = await supabase
        .from("user_games")
        .select("result")
        .eq("user_id", user!.id);
      const total = games?.length ?? 0;
      const wins = games?.filter((g) => g.result === "win").length ?? 0;
      return { total, wins };
    },
  });

  const { data: todayWarmup } = useQuery({
    queryKey: ["today-warmup", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("warmup_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("warmup_date", today)
        .maybeSingle();
      return data;
    },
  });

  const isConnected = !!(profile?.chesscom_username || profile?.lichess_username);
  const hasGames = (gameStats?.total ?? 0) > 0;
  const streak = profile?.warmup_streak ?? 0;
  const didWarmupToday = !!todayWarmup;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            Hey, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Your chess improvement companion. Warm up, train, master.
          </p>
        </motion.div>

        {/* Stats row */}
        {hasGames && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <Swords className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">{gameStats?.total}</p>
              <p className="text-xs text-muted-foreground">Games Synced</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">
                {gameStats ? `${Math.round((gameStats.wins / gameStats.total) * 100)}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xl font-bold text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/connect")}
              className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all sm:col-span-2"
            >
              <Link2 className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Connect Your Account</h3>
              <p className="text-sm text-muted-foreground">
                Link Chess.com or Lichess to import your games and find your weak spots.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/forge")}
            className="p-6 rounded-xl border border-orange-500/30 bg-card cursor-pointer hover:border-orange-500/60 transition-all"
          >
            <Flame className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              {didWarmupToday ? "Warmup Complete ✓" : "Start Your Warmup"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {didWarmupToday
                ? "You've already warmed up today. Go battle or train again."
                : hasGames
                  ? "5-minute warmup based on your recent mistakes."
                  : "Connect your account first to get personalized warmups."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/campaigns")}
            className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Map className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Campaigns</h3>
            <p className="text-sm text-muted-foreground">
              Skill trees for tactics, positional play, and endgames. Level up based on your real games.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          whileHover={{ y: -2 }}
          onClick={() => navigate("/oracle")}
          className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all mb-6"
        >
          <Eye className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">The Oracle — Endgame Mastery</h3>
          <p className="text-sm text-muted-foreground">
            Practice mathematically solved endgames. Defend the draw or convert the win against perfect play.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
