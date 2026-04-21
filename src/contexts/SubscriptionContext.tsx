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

// Legacy free-tier caps kept as 0/Infinity exports so existing UI imports compile
// during the Smart Feed pivot. New feed-based limits will replace these.
const FREE_DAILY_LINES = 0;
const FREE_DAILY_PRACTICES = 0;
const FREE_MAX_STUDIES = 0;
const FREE_MAX_CHAPTERS = 0;

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
  // NOTE: daily_usage tracking removed during pivot to Smart Feed.
  // Old caps (lines/practice/analysis) referred to deleted features.
  // Will be replaced by feed-based limits in a later phase.
  const dailyLinesUsed = 0;
  const dailyPracticesUsed = 0;
  const analysisUsedToday = false;
  const lastTrapLearnedAt: string | null = null;

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
    } else {
      setIsPro(false);
      setLoading(false);
    }
  }, [user, refreshSubscription]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  // Old caps removed during pivot — everyone "can" do these legacy actions.
  // The new feed will gate Pro features differently (ads, Deep Dive cap, etc.).
  const canLearnNewLine = true;
  const canPractice = true;
  const canAnalyze = true;
  const canLearnTrap = true;

  const recordLineLearn = useCallback(async () => {}, []);
  const recordPracticeUse = useCallback(async () => {}, []);
  const recordAnalysisUse = useCallback(async () => {}, []);
  const recordTrapLearn = useCallback(async () => {}, []);

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
