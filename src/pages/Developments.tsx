import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PILLARS } from "@/data/pillarTrials";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Developments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: pillarProgress } = useQuery({
    queryKey: ["pillar-progress-devs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pillar_progress" as any)
        .select("*")
        .eq("user_id", user!.id);
      return (data || []) as any[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">The Developments</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Three pillars of chess mastery. Climb each one floor by floor.
        </p>

        <div className="flex flex-col gap-4">
          {PILLARS.map((pillar, i) => {
            const prog = pillarProgress?.find((p: any) => p.pillar === pillar.id);
            const floor = prog?.current_floor ?? 1;
            const totalFloors = pillar.floors.length;
            const hasContent = pillar.floors.some((f) => f.trials.length > 0);

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => hasContent && navigate(`/pillar/${pillar.id}`)}
                className={`p-6 rounded-xl border transition-all ${
                  hasContent
                    ? `border-border bg-card cursor-pointer hover:border-primary/40 ${pillar.glowColor}`
                    : "border-border/50 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{pillar.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${pillar.color}`}>{pillar.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasContent
                        ? `Floor ${floor} of ${totalFloors} · ${pillar.floors.length} floors`
                        : "Coming soon"}
                    </p>
                    {hasContent && (
                      <Progress value={(floor / totalFloors) * 100} className="h-1 mt-2" />
                    )}
                  </div>
                  {hasContent && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
