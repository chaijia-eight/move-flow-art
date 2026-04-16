import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getLevelFromXp, getRankForXp, getXpProgressInLevel, getStreakMultiplier } from "@/data/rpgData";

export interface PlayerCharacter {
  user_id: string;
  level: number;
  xp: number;
  embers: number;
  current_rank: string;
  streak_days: number;
  longest_streak: number;
  last_ritual_date: string | null;
  main_pillar: string | null;
  equipped_theme: string;
  equipped_piece_set: string;
  equipped_title: string | null;
}

export function usePlayerCharacter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: character, isLoading } = useQuery({
    queryKey: ["player-character", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<PlayerCharacter> => {
      const { data, error } = await supabase
        .from("player_characters" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Auto-create character
        const newChar = {
          user_id: user!.id,
          level: 1,
          xp: 0,
          embers: 0,
          current_rank: "novice",
          streak_days: 0,
          longest_streak: 0,
          equipped_theme: "default",
          equipped_piece_set: "classic",
        };
        const { data: created, error: createErr } = await supabase
          .from("player_characters" as any)
          .insert(newChar)
          .select()
          .single();
        if (createErr) throw createErr;
        return created as unknown as PlayerCharacter;
      }

      return data as unknown as PlayerCharacter;
    },
  });

  const addXpAndEmbers = useMutation({
    mutationFn: async ({ xp, embers }: { xp: number; embers: number }) => {
      if (!character) return;
      const multiplier = getStreakMultiplier(character.streak_days);
      const totalXp = Math.round(xp * multiplier);
      const newXp = character.xp + totalXp;
      const newEmbers = character.embers + embers;
      const newLevel = getLevelFromXp(newXp);
      const newRank = getRankForXp(newXp).id;

      const { error } = await supabase
        .from("player_characters" as any)
        .update({
          xp: newXp,
          embers: newEmbers,
          level: newLevel,
          current_rank: newRank,
        } as any)
        .eq("user_id", character.user_id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["player-character"] }),
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!character) return;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      let newStreak = character.streak_days;
      if (character.last_ritual_date === yesterday) {
        newStreak += 1;
      } else if (character.last_ritual_date !== today) {
        newStreak = 1;
      }

      const { error } = await supabase
        .from("player_characters" as any)
        .update({
          streak_days: newStreak,
          longest_streak: Math.max(newStreak, character.longest_streak),
          last_ritual_date: today,
        } as any)
        .eq("user_id", character.user_id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["player-character"] }),
  });

  const spendEmbers = useMutation({
    mutationFn: async (cost: number) => {
      if (!character || character.embers < cost) throw new Error("Not enough embers");
      const { error } = await supabase
        .from("player_characters" as any)
        .update({ embers: character.embers - cost } as any)
        .eq("user_id", character.user_id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["player-character"] }),
  });

  const computed = character
    ? {
        level: getLevelFromXp(character.xp),
        rank: getRankForXp(character.xp),
        xpProgress: getXpProgressInLevel(character.xp),
        streakMultiplier: getStreakMultiplier(character.streak_days),
      }
    : null;

  return {
    character,
    computed,
    isLoading,
    addXpAndEmbers,
    updateStreak,
    spendEmbers,
  };
}
