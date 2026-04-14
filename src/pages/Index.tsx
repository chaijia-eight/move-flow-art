import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Link2, Zap, ArrowRight, Swords, TrendingUp, BarChart3 } from "lucide-react";
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

  const { data: repertoireCount } = useQuery({
    queryKey: ["home-repertoire-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("user_repertoires")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const isConnected = !!(profile?.chesscom_username || profile?.lichess_username);
  const hasGames = (gameStats?.total ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            Hey, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Stop repeating your mistakes. Drill what actually happened.
          </p>
        </motion.div>

        {/* Stats row — only if there are games */}
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
              <Layers className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">{repertoireCount}</p>
              <p className="text-xs text-muted-foreground">Decks</p>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/connect")}
            className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Link2 className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              {isConnected ? "Manage Accounts" : "Connect Your Account"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? `Connected as ${profile?.chesscom_username || profile?.lichess_username}. Tap to resync or manage.`
                : "Link Chess.com or Lichess to import your games and find your weak spots."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate("/decks")}
            className="p-6 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Layers className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Your Decks</h3>
            <p className="text-sm text-muted-foreground">
              {hasGames
                ? `${repertoireCount} deck${repertoireCount !== 1 ? "s" : ""} ready. View auto-generated and manual drills.`
                : "View your drill decks — auto-generated from games or built manually."}
            </p>
          </motion.div>
        </div>

        {/* Today's drills / Stats CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-8 text-center"
        >
          {hasGames ? (
            <>
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-primary/60" />
              <h3 className="font-semibold text-foreground mb-1">View Your Full Stats</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See win rates, activity trends, and critical position breakdowns.
              </p>
              <Button variant="outline" onClick={() => navigate("/stats")} className="gap-2">
                Open Stats <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="font-semibold text-foreground mb-1">Today's Drills</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your account to get personalized drill recommendations based on your real games.
              </p>
              <Button variant="outline" onClick={() => navigate("/connect")} className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
