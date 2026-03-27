import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  isPro: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  dailyLinesUsed: number;
  practiceUsedToday: boolean;
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
}

const FREE_DAILY_LINES = 2;

const SubscriptionContext = createContext<SubscriptionState>({
  isPro: false,
  subscriptionEnd: null,
  loading: true,
  dailyLinesUsed: 0,
  practiceUsedToday: false,
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
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyLinesUsed, setDailyLinesUsed] = useState(0);
  const [practiceUsedToday, setPracticeUsedToday] = useState(false);
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
      setPracticeUsedToday(data.practice_used);
      setAnalysisUsedToday(data.analysis_used);
      setLastTrapLearnedAt((data as any).last_trap_learned_at ?? null);
    } else {
      setDailyLinesUsed(0);
      setPracticeUsedToday(false);
      setAnalysisUsedToday(false);
      // Check for last_trap_learned_at from any recent row
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
      setPracticeUsedToday(false);
      setAnalysisUsedToday(false);
    }
  }, [user, refreshSubscription, fetchDailyUsage]);

  // Refresh subscription every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const canLearnNewLine = isPro || dailyLinesUsed < FREE_DAILY_LINES;
  const canPractice = isPro || !practiceUsedToday;
  const canAnalyze = isPro || !analysisUsedToday;

  // Rolling 7-day check for traps
  const canLearnTrap = isPro || !lastTrapLearnedAt || 
    (Date.now() - new Date(lastTrapLearnedAt).getTime() > 7 * 24 * 60 * 60 * 1000);

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
    setPracticeUsedToday(true);
  }, [user, isPro]);

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

  return (
    <SubscriptionContext.Provider value={{
      isPro,
      subscriptionEnd,
      loading,
      dailyLinesUsed,
      practiceUsedToday,
      analysisUsedToday,
      canLearnNewLine,
      canPractice,
      canAnalyze,
      recordLineLearn,
      recordPracticeUse,
      recordAnalysisUse,
      refreshSubscription,
      startCheckout,
      openCustomerPortal,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
export { FREE_DAILY_LINES };
