import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Skull, Minus, ExternalLink, Swords } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Games() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: games, isLoading } = useQuery({
    queryKey: ["games-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", user!.id)
        .order("played_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const { data: positionCounts } = useQuery({
    queryKey: ["games-position-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("game_id")
        .eq("user_id", user!.id);
      const map = new Map<string, number>();
      (data || []).forEach((p: any) => {
        if (p.game_id) map.set(p.game_id, (map.get(p.game_id) ?? 0) + 1);
      });
      return map;
    },
  });

  const resultIcon = (r: string | null) => {
    if (r === "win") return <Trophy className="w-4 h-4 text-emerald-400" />;
    if (r === "loss") return <Skull className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const formatTimeControl = (tc: string | null) => {
    if (!tc) return null;
    // Daily/correspondence (e.g. "1/86400")
    if (tc.includes("/")) {
      const days = Math.round(Number(tc.split("/")[1]) / 86400);
      return `${days}d`;
    }
    // Non-numeric (e.g. lichess speed labels like "blitz")
    if (!/^\d/.test(tc)) return tc;
    const [baseStr, incStr] = tc.split("+");
    const baseSec = Number(baseStr);
    if (!Number.isFinite(baseSec)) return tc;
    const baseMin = baseSec % 60 === 0 ? `${baseSec / 60}` : (baseSec / 60).toFixed(1);
    const inc = incStr != null ? Number(incStr) : 0;
    return Number.isFinite(inc) && inc > 0 ? `${baseMin}+${inc}` : `${baseMin} min`;
  };

  const externalUrl = (g: any) => {
    if (g.platform === "chesscom") return `https://www.chess.com/game/live/${g.game_id}`;
    if (g.platform === "lichess") return `https://lichess.org/${g.game_id}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Games</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your synced games from Chess.com and Lichess.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : !games?.length ? (
          <div className="text-center py-16">
            <Swords className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No games yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Chess.com or Lichess account to sync games.
            </p>
            <Button onClick={() => navigate("/connect")}>Connect Account</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((g: any) => {
              const url = externalUrl(g);
              const mistakeCount = positionCounts?.get(g.id) ?? 0;
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg border border-border bg-card flex items-center gap-4 hover:border-primary/40 transition-all"
                >
                  {resultIcon(g.result)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground truncate">
                        vs {g.opponent ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{g.platform}</span>
                      {g.time_control && (
                        <span className="text-xs text-muted-foreground">· {formatTimeControl(g.time_control)}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {g.played_at ? new Date(g.played_at).toLocaleDateString() : "—"}
                      {mistakeCount > 0 && (
                        <span className="ml-2 text-orange-400">· {mistakeCount} critical position{mistakeCount === 1 ? "" : "s"}</span>
                      )}
                      {!g.analyzed && (
                        <span className="ml-2 text-muted-foreground/70">· not analyzed</span>
                      )}
                    </div>
                  </div>
                  {mistakeCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mistakes`)}
                    >
                      Review
                    </Button>
                  )}
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Open in platform"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
