import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Shield, Swords, Crown, Lock, Link2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerCharacter } from "@/hooks/usePlayerCharacter";
import CharacterAvatar from "@/components/CharacterAvatar";
import { PILLARS } from "@/data/pillarTrials";
import { getStreakMultiplier } from "@/data/rpgData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function ForgeHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { character, computed, isLoading } = usePlayerCharacter();

  const { data: profile } = useQuery({
    queryKey: ["hub-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("chesscom_username, lichess_username")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: todayRitual } = useQuery({
    queryKey: ["today-ritual", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_rituals" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("ritual_date", today)
        .maybeSingle();
      return data as any;
    },
  });

  const { data: pillarProgress } = useQuery({
    queryKey: ["pillar-progress-hub", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pillar_progress" as any)
        .select("*")
        .eq("user_id", user!.id);
      return (data || []) as any[];
    },
  });

  const isConnected = !!(profile?.chesscom_username || profile?.lichess_username);
  const ritualDone = todayRitual?.quest_1_completed && todayRitual?.quest_2_completed && todayRitual?.quest_3_completed;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Flame className="w-12 h-12 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-red-500/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6">
        {/* XP Bar */}
        {computed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  Level {computed.level}
                </span>
                <span className="text-xs text-muted-foreground">
                  {computed.xpProgress.current.toLocaleString()} / {computed.xpProgress.needed.toLocaleString()} XP
                </span>
              </div>
              <Progress
                value={(computed.xpProgress.current / computed.xpProgress.needed) * 100}
                className="h-2"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-400 font-bold">🔥 {character?.embers ?? 0}</span>
              {character && character.streak_days >= 3 && (
                <span className="text-xs text-orange-300/70">
                  {getStreakMultiplier(character.streak_days)}x
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Character + Hub */}
        <div className="flex flex-col items-center mb-8">
          {character && (
            <CharacterAvatar
              xp={character.xp}
              streakDays={character.streak_days}
              mainPillar={character.main_pillar}
              equippedTitle={character.equipped_title}
              size="lg"
            />
          )}
        </div>

        {/* Connect prompt */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/connect")}
            className="p-5 rounded-xl border border-primary/30 bg-card cursor-pointer hover:border-primary/60 transition-all mb-6 flex items-center gap-4"
          >
            <Link2 className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">The Scrying Pool Awaits</h3>
              <p className="text-sm text-muted-foreground">
                Link your Chess.com or Lichess account. The forge reads your games to forge your training.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        )}

        {/* The Anvil — Daily Ritual */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div
            onClick={() => navigate("/ritual")}
            className={`p-6 rounded-xl border cursor-pointer transition-all ${
              ritualDone
                ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                : "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5 hover:border-orange-500/60"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Flame className={`w-7 h-7 ${ritualDone ? "text-emerald-400" : "text-orange-500"}`} />
              <h2 className="text-lg font-bold text-foreground">
                {ritualDone ? "Ritual Complete ✓" : "The Daily Ritual"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {ritualDone
                ? "You've forged your skills today. Return tomorrow for new quests."
                : "Three quests forged from your weaknesses. Complete them all for bonus XP and Embers."}
            </p>
            {!ritualDone && (
              <div className="mt-3 flex gap-2">
                {[todayRitual?.quest_1_completed, todayRitual?.quest_2_completed, todayRitual?.quest_3_completed].map((done, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${done ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* The Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4" /> The Pillars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PILLARS.map((pillar) => {
              const prog = pillarProgress?.find((p: any) => p.pillar === pillar.id);
              const floor = prog?.current_floor ?? 1;
              const totalFloors = pillar.floors.length;
              const hasContent = pillar.floors.some((f) => f.trials.length > 0);

              return (
                <motion.div
                  key={pillar.id}
                  whileHover={hasContent ? { y: -2 } : undefined}
                  onClick={() => hasContent && navigate(`/pillar/${pillar.id}`)}
                  className={`p-5 rounded-xl border transition-all ${
                    hasContent
                      ? `border-border bg-card cursor-pointer hover:border-primary/40 ${pillar.glowColor}`
                      : "border-border/50 bg-card/50 opacity-60"
                  }`}
                >
                  <div className="text-2xl mb-2">{pillar.icon}</div>
                  <h3 className={`font-bold ${pillar.color}`}>{pillar.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasContent
                      ? `Floor ${floor} of ${totalFloors}`
                      : "Coming soon"}
                  </p>
                  {hasContent && (
                    <Progress
                      value={(floor / totalFloors) * 100}
                      className="h-1 mt-2"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom row: Vault + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <div
            onClick={() => navigate("/vault")}
            className="p-5 rounded-xl border border-yellow-500/20 bg-card cursor-pointer hover:border-yellow-500/40 transition-all"
          >
            <Lock className="w-6 h-6 text-yellow-500 mb-2" />
            <h3 className="font-semibold text-foreground text-sm">The Vault</h3>
            <p className="text-xs text-muted-foreground">Themes, titles, cosmetics</p>
          </div>
          <div
            onClick={() => navigate("/stats")}
            className="p-5 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-all"
          >
            <Shield className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold text-foreground text-sm">Scrying Pool</h3>
            <p className="text-xs text-muted-foreground">Battle history & analytics</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
