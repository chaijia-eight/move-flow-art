import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressState {
  consumerXp: number;
  consumerLevel: number;
  currentStreak: number;
  bestStreak: number;
  lastStreakDate: string | null;
  loading: boolean;
}

const XP_PER_LEVEL = 100;

function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(prev: string): boolean {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10) === prev;
}

export function useProgress() {
  const { user } = useAuth();
  const [state, setState] = useState<ProgressState>({
    consumerXp: 0,
    consumerLevel: 1,
    currentStreak: 0,
    bestStreak: 0,
    lastStreakDate: null,
    loading: true,
  });

  // Initial fetch
  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select(
          "consumer_xp, consumer_level, current_streak, best_streak, last_streak_date",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setState({
        consumerXp: data?.consumer_xp ?? 0,
        consumerLevel: data?.consumer_level ?? 1,
        currentStreak: data?.current_streak ?? 0,
        bestStreak: data?.best_streak ?? 0,
        lastStreakDate: data?.last_streak_date ?? null,
        loading: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /**
   * Award XP for a solve. Returns the deltas so the UI can animate.
   */
  const awardSolve = useCallback(
    async (xp: number) => {
      if (!user) {
        return { xp, leveledUp: false, newLevel: state.consumerLevel, streakBumped: false };
      }

      const today = todayUtc();
      const prevDate = state.lastStreakDate;
      let nextStreak = state.currentStreak;
      let streakBumped = false;
      if (prevDate === today) {
        // already counted today
      } else if (prevDate && isYesterday(prevDate)) {
        nextStreak = state.currentStreak + 1;
        streakBumped = true;
      } else {
        nextStreak = 1;
        streakBumped = state.currentStreak !== 1;
      }
      const nextBest = Math.max(state.bestStreak, nextStreak);

      const newXp = state.consumerXp + xp;
      const oldLevel = state.consumerLevel;
      const newLevel = levelFromXp(newXp);
      const leveledUp = newLevel > oldLevel;

      // Optimistic update
      setState({
        consumerXp: newXp,
        consumerLevel: newLevel,
        currentStreak: nextStreak,
        bestStreak: nextBest,
        lastStreakDate: today,
        loading: false,
      });

      const { error } = await supabase
        .from("user_profiles")
        .update({
          consumer_xp: newXp,
          consumer_level: newLevel,
          current_streak: nextStreak,
          best_streak: nextBest,
          last_streak_date: today,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("[useProgress] update failed", error);
      }

      return { xp, leveledUp, newLevel, streakBumped };
    },
    [user, state],
  );

  return { ...state, awardSolve };
}
