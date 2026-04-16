import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Swords, Brain, Crown, Lock, CheckCircle, Star, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { campaignNodes, getNodesByBranch, type CampaignNode } from "@/data/campaignData";

const branchMeta = {
  tactics: { label: "Tactics", icon: Swords, color: "text-red-400", border: "border-red-500/30", glow: "shadow-red-500/20" },
  positional: { label: "Positional", icon: Brain, color: "text-blue-400", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  endgames: { label: "Endgames", icon: Crown, color: "text-purple-400", border: "border-purple-500/30", glow: "shadow-purple-500/20" },
} as const;

type Branch = keyof typeof branchMeta;

function getNodeStatus(
  node: CampaignNode,
  progressMap: Record<string, { mastered: boolean; best_accuracy: number | null; attempts: number; xp: number }>,
  branchNodes: CampaignNode[],
): "locked" | "active" | "mastered" {
  const p = progressMap[node.id];
  if (p?.mastered) return "mastered";
  if (node.position === 0) return "active";
  const prev = branchNodes[node.position - 1];
  if (prev && progressMap[prev.id]?.mastered) return "active";
  return "locked";
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function Campaigns() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: progress } = useQuery({
    queryKey: ["campaign-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("skill_tree_progress")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: positionCounts } = useQuery({
    queryKey: ["campaign-recommendations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_positions")
        .select("category")
        .eq("user_id", user!.id);
      const counts = { blunder: 0, missed_tactic: 0, defensive_crux: 0, endgame_tech: 0 };
      (data ?? []).forEach((p) => { if (p.category in counts) counts[p.category as keyof typeof counts]++; });
      return counts;
    },
  });

  const progressMap = useMemo(() => {
    const map: Record<string, { mastered: boolean; best_accuracy: number | null; attempts: number; xp: number }> = {};
    (progress ?? []).forEach((p) => {
      map[p.skill_name] = { mastered: p.mastered, best_accuracy: p.best_accuracy, attempts: p.attempts, xp: p.xp };
    });
    return map;
  }, [progress]);

  const totalXp = useMemo(() => (progress ?? []).reduce((s, p) => s + p.xp, 0), [progress]);

  const recommendedBranch = useMemo<Branch | null>(() => {
    if (!positionCounts) return null;
    const tactical = positionCounts.blunder + positionCounts.missed_tactic;
    const positional = positionCounts.defensive_crux;
    const endgame = positionCounts.endgame_tech;
    if (tactical >= positional && tactical >= endgame && tactical > 0) return "tactics";
    if (endgame >= positional && endgame > 0) return "endgames";
    if (positional > 0) return "positional";
    return "tactics";
  }, [positionCounts]);

  const branches: Branch[] = ["tactics", "positional", "endgames"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header + XP */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Map className="w-7 h-7 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-foreground">Campaigns</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-foreground">{totalXp}</span>
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
          </div>
          <p className="text-muted-foreground">Level up your chess through structured skill trees.</p>
        </motion.div>

        {/* Three branches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch, bi) => {
            const meta = branchMeta[branch];
            const Icon = meta.icon;
            const nodes = getNodesByBranch(branch);
            const isRecommended = recommendedBranch === branch;

            return (
              <motion.div
                key={branch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bi * 0.1 }}
                className={`rounded-xl border ${meta.border} bg-card overflow-hidden ${isRecommended ? `shadow-lg ${meta.glow}` : ""}`}
              >
                {/* Branch header */}
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{meta.label}</h3>
                    {isRecommended && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">★ Recommended</span>
                    )}
                  </div>
                </div>

                {/* Nodes */}
                <div className="p-4 flex flex-col gap-1">
                  {nodes.map((node, ni) => {
                    const status = getNodeStatus(node, progressMap, nodes);
                    const p = progressMap[node.id];
                    const stars = p?.best_accuracy != null ? (p.best_accuracy >= 0.8 ? 3 : p.best_accuracy >= 0.5 ? 2 : 1) : 0;
                    const hasPuzzles = node.puzzles.length > 0;
                    const canClick = status !== "locked" && hasPuzzles;

                    return (
                      <React.Fragment key={node.id}>
                        {/* Connector line */}
                        {ni > 0 && (
                          <div className="flex justify-center">
                            <div className={`w-0.5 h-4 ${status === "locked" ? "bg-muted-foreground/20" : "bg-primary/40"}`} />
                          </div>
                        )}
                        <motion.div
                          whileHover={canClick ? { scale: 1.02 } : undefined}
                          onClick={canClick ? () => navigate(`/campaigns/drill/${node.id}`) : undefined}
                          className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            status === "mastered"
                              ? "border-yellow-500/40 bg-yellow-500/5 cursor-pointer"
                              : status === "active"
                                ? canClick
                                  ? "border-primary/40 bg-primary/5 cursor-pointer hover:border-primary/60"
                                  : "border-primary/20 bg-primary/5 opacity-60"
                                : "border-border/30 bg-background/50 opacity-40"
                          }`}
                        >
                          {/* Status icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            status === "mastered"
                              ? "bg-yellow-500/20"
                              : status === "active"
                                ? "bg-primary/20"
                                : "bg-muted-foreground/10"
                          }`}>
                            {status === "mastered" ? (
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                            ) : status === "locked" ? (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                            ) : (
                              <span className="text-xs font-bold text-primary">{node.position + 1}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{node.name}</p>
                            {status !== "locked" && p && p.attempts > 0 && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <StarRating stars={stars} />
                                <span className="text-[10px] text-muted-foreground">{p.attempts}x</span>
                              </div>
                            )}
                            {status === "active" && !hasPuzzles && (
                              <p className="text-[10px] text-muted-foreground italic">Coming soon</p>
                            )}
                          </div>

                          {status !== "locked" && (
                            <span className="text-[10px] text-muted-foreground font-mono">+{node.xpReward}xp</span>
                          )}
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
