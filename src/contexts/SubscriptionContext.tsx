import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  isPro: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  dailyLinesUsed: number;
  dailyPracticesUsed: number;
  analysisUsedToday: boolean;
  canLearnNewLine: boolean;
  canPractice: boolean;
  canAnalyze: boolean;
  canLearnTrap: boolean;
  lastTrapLearnedAt: string | null;
  recordLineLearn: () => Promise<void>;
  recordPracticeUse: () => Promise<void>;
  recordAnalysisUse: () => Promise<void>;
  recordTrapLearn: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  startCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  maxStudies: number;
  maxChaptersPerStudy: number;
}

const FREE_DAILY_LINES = 3;
const FREE_DAILY_PRACTICES = 2;
const FREE_MAX_STUDIES = 2;
const FREE_MAX_CHAPTERS = 4;

const SubscriptionContext = createContext<SubscriptionState>({
  isPro: false,
  subscriptionEnd: null,
  loading: true,
  dailyLinesUsed: 0,
  dailyPracticesUsed: 0,
  analysisUsedToday: false,
  canLearnNewLine: true,
  canPractice: true,
  canAnalyze: true,
  canLearnTrap: true,
  lastTrapLearnedAt: null,
  recordLineLearn: async () => {},
  recordPracticeUse: async () => {},
  recordAnalysisUse: async () => {},
  recordTrapLearn: async () => {},
  refreshSubscription: async () => {},
  startCheckout: async () => {},
  openCustomerPortal: async () => {},
  maxStudies: FREE_MAX_STUDIES,
  maxChaptersPerStudy: FREE_MAX_CHAPTERS,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyLinesUsed, setDailyLinesUsed] = useState(0);
  const [dailyPracticesUsed, setDailyPracticesUsed] = useState(0);
  const [analysisUsedToday, setAnalysisUsedToday] = useState(false);
  const [lastTrapLearnedAt, setLastTrapLearnedAt] = useState<string | null>(null);

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const fetchDailyUsage = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_usage")
      .select("lines_learned, practice_used, analysis_used, last_trap_learned_at")
      .eq("user_id", user.id)
      .eq("usage_date", todayStr())
      .maybeSingle();

    if (data) {
      setDailyLinesUsed(data.lines_learned);
      // practice_used is boolean in DB — treat true as 1 for backward compat
      setDailyPracticesUsed(data.practice_used ? 1 : 0);
      setAnalysisUsedToday(data.analysis_used);
      setLastTrapLearnedAt((data as any).last_trap_learned_at ?? null);
    } else {
      setDailyLinesUsed(0);
      setDailyPracticesUsed(0);
      setAnalysisUsedToday(false);
      const { data: recentTrap } = await supabase
        .from("daily_usage")
        .select("last_trap_learned_at")
        .eq("user_id", user.id)
        .not("last_trap_learned_at", "is", null)
        .order("usage_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastTrapLearnedAt((recentTrap as any)?.last_trap_learned_at ?? null);
    }
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    if (!session) {
      setIsPro(false);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setIsPro(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (e) {
      console.error("Failed to check subscription:", e);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      refreshSubscription();
      fetchDailyUsage();
    } else {
      setIsPro(false);
      setLoading(false);
      setDailyLinesUsed(0);
      setDailyPracticesUsed(0);
      setAnalysisUsedToday(false);
    }
  }, [user, refreshSubscription, fetchDailyUsage]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const canLearnNewLine = isPro || dailyLinesUsed < FREE_DAILY_LINES;
  const canPractice = isPro || dailyPracticesUsed < FREE_DAILY_PRACTICES;
  const canAnalyze = isPro || !analysisUsedToday;
  // Traps now count as regular lines — no special weekly limit
  const canLearnTrap = canLearnNewLine;

  const recordLineLearn = useCallback(async () => {
    if (!user || isPro) return;
    const today = todayStr();
    const { data: existing } = await supabase
      .from("daily_usage")
      .select("id, lines_learned")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("daily_usage")
        .update({ lines_learned: existing.lines_learned + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      setDailyLinesUsed(existing.lines_learned + 1);
    } else {
      await supabase
        .from("daily_usage")
        .insert({ user_id: user.id, usage_date: today, lines_learned: 1 });
      setDailyLinesUsed(1);
    }
  }, [user, isPro]);

  const recordPracticeUse = useCallback(async () => {
    if (!user || isPro) return;
    const today = todayStr();
    const newCount = dailyPracticesUsed + 1;
    const { data: existing } = await supabase
      .from("daily_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("daily_usage")
        .update({ practice_used: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("daily_usage")
        .insert({ user_id: user.id, usage_date: today, practice_used: true });
    }
    setDailyPracticesUsed(newCount);
  }, [user, isPro, dailyPracticesUsed]);

  const recordAnalysisUse = useCallback(async () => {
    if (!user) return;
    const today = todayStr();
    const { data: existing } = await supabase
      .from("daily_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("daily_usage")
        .update({ analysis_used: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("daily_usage")
        .insert({ user_id: user.id, usage_date: today, analysis_used: true });
    }
    setAnalysisUsedToday(true);
  }, [user]);

  const recordTrapLearn = useCallback(async () => {
    // Traps now use the regular line limit
    return recordLineLearn();
  }, [recordLineLearn]);

  const startCheckout = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  }, []);

  const maxStudies = isPro ? Infinity : FREE_MAX_STUDIES;
  const maxChaptersPerStudy = isPro ? Infinity : FREE_MAX_CHAPTERS;

  return (
    <SubscriptionContext.Provider value={{
      isPro,
      subscriptionEnd,
      loading,
      dailyLinesUsed,
      dailyPracticesUsed,
      analysisUsedToday,
      canLearnNewLine,
      canPractice,
      canAnalyze,
      canLearnTrap,
      lastTrapLearnedAt,
      recordLineLearn,
      recordPracticeUse,
      recordAnalysisUse,
      recordTrapLearn,
      refreshSubscription,
      startCheckout,
      openCustomerPortal,
      maxStudies,
      maxChaptersPerStudy,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
export { FREE_DAILY_LINES, FREE_DAILY_PRACTICES, FREE_MAX_STUDIES, FREE_MAX_CHAPTERS };
