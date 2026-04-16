import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle, Swords, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPillar, TRIALS_TO_PASS } from "@/data/pillarTrials";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function PillarView() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pillar = getPillar(pillarId || "");

  const { data: progress } = useQuery({
    queryKey: ["pillar-detail", user?.id, pillarId],
    enabled: !!user && !!pillarId,
    queryFn: async () => {
      const { data } = await supabase
        .from("pillar_progress" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("pillar", pillarId!)
        .maybeSingle();
      return data as any;
    },
  });

  const { data: trialHistory } = useQuery({
    queryKey: ["trial-history", user?.id, pillarId],
    enabled: !!user && !!pillarId,
    queryFn: async () => {
      const { data } = await supabase
        .from("trial_history" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("pillar", pillarId!);
      return (data || []) as any[];
    },
  });

  if (!pillar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Pillar not found</p>
      </div>
    );
  }

  const currentFloor = progress?.current_floor ?? 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className={`text-2xl font-bold ${pillar.color}`}>
              {pillar.icon} {pillar.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Floor {currentFloor} of {pillar.floors.length}
            </p>
          </div>
        </div>

        {/* Floors — displayed bottom to top visually */}
        <div className="flex flex-col-reverse gap-3">
          {pillar.floors.map((floor, floorIdx) => {
            const floorNum = floorIdx + 1;
            const isUnlocked = floorNum <= currentFloor;
            const isCurrent = floorNum === currentFloor;
            const isComplete = floorNum < currentFloor;
            const hasTrials = floor.trials.length > 0;

            // Get trial history for this floor
            const floorTrials = trialHistory?.filter(
              (t: any) => t.floor_number === floorNum
            ) || [];
            const passedCount = floorTrials.filter((t: any) => t.passed).length;

            return (
              <motion.div
                key={floor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: floorIdx * 0.05 }}
                onClick={() => {
                  if (isUnlocked && hasTrials) {
                    navigate(`/trial/${pillar.id}/${floorNum}`);
                  }
                }}
                className={`p-5 rounded-xl border transition-all ${
                  isComplete
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isCurrent && hasTrials
                      ? `border-primary/40 bg-card cursor-pointer hover:border-primary/60 ${pillar.glowColor}`
                      : !isUnlocked || !hasTrials
                        ? "border-border/30 bg-card/30 opacity-50"
                        : "border-border bg-card cursor-pointer hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                    isComplete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : !isUnlocked ? <Lock className="w-5 h-5" /> : floorNum}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{floor.name}</h3>
                    <p className="text-xs text-muted-foreground">{floor.description}</p>
                    {isUnlocked && hasTrials && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {passedCount} / {floor.trials.length} trials passed
                        {passedCount >= TRIALS_TO_PASS && " ✓"}
                      </p>
                    )}
                    {!hasTrials && <p className="text-xs text-muted-foreground/60 mt-1">Coming soon</p>}
                  </div>
                  {isUnlocked && hasTrials && !isComplete && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
