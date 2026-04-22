import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, Target, RefreshCw, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Weakness {
  weakness_tag: string;
  severity_score: number;
  times_missed: number;
  times_solved_since: number;
  status: string;
}

export default function Me() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    consumerXp,
    consumerLevel,
    currentStreak,
    bestStreak,
  } = useProgress();
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadWeaknesses = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_weaknesses")
      .select("weakness_tag, severity_score, times_missed, times_solved_since, status")
      .eq("user_id", user.id)
      .order("severity_score", { ascending: false });
    setWeaknesses((data ?? []) as Weakness[]);
    setLoading(false);
  };

  useEffect(() => {
    loadWeaknesses();
  }, [user?.id]);

  const handleAnalyze = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-weaknesses");
      if (error) throw error;
      toast({
        title: "Analysis complete",
        description: `Reviewed ${data?.positionsAnalyzed ?? 0} positions and updated ${data?.weaknessesUpdated ?? 0} weakness tags.`,
      });
      await loadWeaknesses();
    } catch (e: any) {
      toast({
        title: "Couldn't analyze",
        description: e.message ?? "Try again later",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.email?.split("@")[0] ?? "You"}
          </h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Sparkles className="w-4 h-4" />}
            label="Level"
            value={consumerLevel}
            sub={`${consumerXp} XP`}
          />
          <StatCard
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label="Streak"
            value={currentStreak}
            sub={`Best ${bestStreak}`}
          />
          <StatCard
            icon={<Trophy className="w-4 h-4 text-amber-400" />}
            label="Weak spots"
            value={weaknesses.length}
            sub="tracked"
          />
        </div>

        {/* Weaknesses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your weaknesses
            </h2>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
              {analyzing ? "Analyzing…" : "Re-analyze"}
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : weaknesses.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <p className="mb-2">
                No weaknesses detected yet. Link a Chess.com or Lichess account to get
                a personalized For You feed.
              </p>
              <a
                href="/connect"
                className="inline-flex items-center gap-1.5 text-primary font-medium"
              >
                <Target className="w-4 h-4" /> Connect an account
              </a>
            </div>
          ) : (
            <ul className="space-y-2">
              {weaknesses.map((w) => (
                <li
                  key={w.weakness_tag}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground capitalize">
                      {w.weakness_tag.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Missed {w.times_missed} · solved {w.times_solved_since} since
                    </div>
                  </div>
                  <SeverityBar score={w.severity_score} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function SeverityBar({ score }: { score: number }) {
  const pct = Math.max(10, Math.min(100, score * 10));
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-5 text-right">
        {score}
      </span>
    </div>
  );
}
