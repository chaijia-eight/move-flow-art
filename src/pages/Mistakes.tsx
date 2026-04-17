import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Target, Shield, Crown, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import MiniBoard from "@/components/MiniBoard";

type Category = "all" | "blunder" | "missed_tactic" | "defensive_crux" | "endgame_tech";

const CATEGORY_META: Record<Exclude<Category, "all">, { label: string; icon: typeof AlertTriangle; color: string }> = {
  blunder: { label: "Blunders", icon: AlertTriangle, color: "text-red-400" },
  missed_tactic: { label: "Missed Tactics", icon: Target, color: "text-orange-400" },
  defensive_crux: { label: "Defensive Cruxes", icon: Shield, color: "text-blue-400" },
  endgame_tech: { label: "Endgame Technique", icon: Crown, color: "text-amber-400" },
};

export default function Mistakes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Category>("all");
  const [showDrilled, setShowDrilled] = useState(false);

  const { data: positions, isLoading } = useQuery({
    queryKey: ["mistakes", user?.id, filter, showDrilled],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("user_positions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") q = q.eq("category", filter);
      if (!showDrilled) q = q.eq("drilled", false);
      const { data } = await q;
      return data || [];
    },
  });

  const counts = useMemo(() => {
    const c = { blunder: 0, missed_tactic: 0, defensive_crux: 0, endgame_tech: 0 };
    positions?.forEach((p: any) => {
      if (p.category in c) (c as any)[p.category]++;
    });
    return c;
  }, [positions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Mistakes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Critical positions from your synced games. Click any to drill.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({positions?.length ?? 0})
          </Button>
          {(Object.keys(CATEGORY_META) as Array<Exclude<Category, "all">>).map((key) => {
            const meta = CATEGORY_META[key];
            const Icon = meta.icon;
            return (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${meta.color}`} />
                {meta.label} ({(counts as any)[key]})
              </Button>
            );
          })}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDrilled((v) => !v)}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            {showDrilled ? "Hide drilled" : "Show drilled"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : !positions?.length ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No mistakes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sync and analyze your games to see critical positions here.
            </p>
            <Button onClick={() => navigate("/connect")}>Connect Account</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((pos: any) => {
              const meta = CATEGORY_META[pos.category as keyof typeof CATEGORY_META];
              const Icon = meta?.icon ?? AlertTriangle;
              return (
                <motion.div
                  key={pos.id}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/ritual?position=${pos.id}`)}
                  className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${meta?.color ?? "text-muted-foreground"}`} />
                      <span className="text-xs font-medium text-foreground">{meta?.label ?? pos.category}</span>
                    </div>
                    {pos.drilled && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400">Drilled</span>
                    )}
                  </div>
                  <div className="mb-3 rounded-md overflow-hidden">
                    <MiniBoard fen={pos.fen} theme="default" />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Move {pos.move_number}: <span className="text-foreground font-mono">{pos.your_move_san ?? "?"}</span></div>
                    <div>Best: <span className="text-emerald-400 font-mono">{pos.engine_best_san ?? "?"}</span></div>
                    {pos.eval_before != null && pos.eval_after != null && (
                      <div className="text-red-400">
                        Lost {Math.abs((pos.eval_before - pos.eval_after)).toFixed(1)} pawns
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
