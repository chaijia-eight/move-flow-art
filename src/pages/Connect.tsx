import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, RefreshCw, X, Unlink, Shield, Search, Database, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { analyzeAndDetect } from "@/lib/analyzeAndDetect";

type Platform = "chesscom" | "lichess";

interface SyncStep {
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "done";
}

const SYNC_STEPS: { label: string; icon: React.ElementType; delay: number }[] = [
  { label: "Verifying account", icon: Shield, delay: 0 },
  { label: "Fetching game archives", icon: Search, delay: 1500 },
  { label: "Downloading PGN data", icon: Database, delay: 3500 },
  { label: "Scanning for critical positions", icon: Sparkles, delay: 6000 },
  { label: "Building drill candidates", icon: BarChart3, delay: 8000 },
];

interface SyncState {
  loading: boolean;
  error: string | null;
  result: { gamesFound: number; gamesInserted: number } | null;
}

interface AnalysisState {
  running: boolean;
  /** Free-text label shown under the active step. */
  detail: string;
  positionsFound: number;
  weaknessesUpdated: number;
}

export default function Connect() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>(null);
  const [username, setUsername] = useState("");
  const [syncState, setSyncState] = useState<SyncState>({ loading: false, error: null, result: null });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    running: false,
    detail: "",
    positionsFound: 0,
    weaknessesUpdated: 0,
  });

  // Animate progress steps while loading
  useEffect(() => {
    if (!syncState.loading) {
      setActiveStepIndex(0);
      setSyncProgress(0);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    SYNC_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setActiveStepIndex(i);
        setSyncProgress(Math.min(((i + 1) / SYNC_STEPS.length) * 90, 90));
      }, step.delay));
    });

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setSyncProgress((prev) => Math.min(prev + 0.5, 90));
    }, 100);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [syncState.loading]);

  // Jump to 100% on completion
  useEffect(() => {
    if (syncState.result && !analysisState.running) {
      setActiveStepIndex(SYNC_STEPS.length);
      setSyncProgress(100);
    }
  }, [syncState.result, analysisState.running]);

  // Fetch existing profile
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch game counts
  const { data: gameCounts } = useQuery({
    queryKey: ["game-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count: chesscomCount } = await supabase
        .from("user_games")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("platform", "chesscom");
      const { count: lichessCount } = await supabase
        .from("user_games")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("platform", "lichess");
      return { chesscom: chesscomCount ?? 0, lichess: lichessCount ?? 0 };
    },
  });

  /**
   * Run client-side analysis + weakness detection for the freshly synced games.
   * Drives the last two steps in the sync UI ("Scanning…" and "Building…").
   */
  const runAnalysisPipeline = async () => {
    if (!user) return;
    setAnalysisState({
      running: true,
      detail: "Loading games…",
      positionsFound: 0,
      weaknessesUpdated: 0,
    });
    setActiveStepIndex(3); // "Scanning for critical positions"
    setSyncProgress(70);
    try {
      const result = await analyzeAndDetect(user.id, (p) => {
        if (p.phase === "loading") {
          setAnalysisState((s) => ({ ...s, detail: "Loading games…" }));
        } else if (p.phase === "analyzing") {
          setActiveStepIndex(3);
          setAnalysisState((s) => ({
            ...s,
            detail: `Analyzing game ${p.gameIndex + 1} of ${p.totalGames}…`,
            positionsFound: p.positionsFound,
          }));
          // Spread analysis progress across 70 → 90.
          const frac = p.totalGames > 0 ? p.gameIndex / p.totalGames : 0;
          setSyncProgress(70 + frac * 20);
        } else if (p.phase === "detecting") {
          setActiveStepIndex(4); // "Building drill candidates"
          setSyncProgress(95);
          setAnalysisState((s) => ({
            ...s,
            detail: "Building drill candidates…",
            positionsFound: p.positionsFound,
          }));
        } else if (p.phase === "done") {
          setActiveStepIndex(SYNC_STEPS.length);
          setSyncProgress(100);
        }
      });
      setAnalysisState({
        running: false,
        detail: result.alreadyAnalyzed
          ? "All games were already analyzed."
          : `Found ${result.positionsFound} critical positions across ${result.gamesAnalyzed} games.`,
        positionsFound: result.positionsFound,
        weaknessesUpdated: result.weaknessesUpdated,
      });
      toast({
        title: "Analysis complete",
        description: `${result.positionsFound} critical positions · ${result.weaknessesUpdated} weakness tags updated.`,
      });
    } catch (e: any) {
      console.error("[Connect] analysis pipeline failed", e);
      setAnalysisState((s) => ({ ...s, running: false, detail: e?.message ?? "Analysis failed" }));
      toast({
        title: "Analysis failed",
        description: e?.message ?? "We synced your games but couldn't analyze them. Open the Me page to retry.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (platform: Platform) => {
    if (!user || !username.trim()) return;

    setSyncState({ loading: true, error: null, result: null });

    try {
      const { data, error } = await supabase.functions.invoke("fetch-games", {
        body: { platform, username: username.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSyncState({
        loading: false,
        error: null,
        result: { gamesFound: data.gamesFound, gamesInserted: data.gamesInserted },
      });

      toast({
        title: "Games synced!",
        description: `Found ${data.gamesFound} games from the last 30 days.`,
      });

      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["game-counts"] });

      setUsername("");
      // Run the real analysis pipeline (sets its own progress).
      await runAnalysisPipeline();
      setTimeout(() => {
        setExpandedPlatform(null);
        setSyncState({ loading: false, error: null, result: null });
      }, 4000);
    } catch (err: any) {
      setSyncState({
        loading: false,
        error: err.message || "Failed to sync games",
        result: null,
      });
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    if (!user || !confirm(`Disconnect ${platform === "chesscom" ? "Chess.com" : "Lichess"}? This will remove all imported games.`)) return;

    await supabase
      .from("user_games")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    const updateData = platform === "chesscom"
      ? { chesscom_username: "" }
      : { lichess_username: "" };

    await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", user.id);

    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    queryClient.invalidateQueries({ queryKey: ["game-counts"] });

    toast({ title: "Disconnected", description: `${platform === "chesscom" ? "Chess.com" : "Lichess"} account removed.` });
  };

  const handleResync = async (platform: Platform) => {
    const uname = platform === "chesscom" ? profile?.chesscom_username : profile?.lichess_username;
    if (!uname) return;

    setSyncState({ loading: true, error: null, result: null });
    setExpandedPlatform(platform);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-games", {
        body: { platform, username: uname },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSyncState({
        loading: false,
        error: null,
        result: { gamesFound: data.gamesFound, gamesInserted: data.gamesInserted },
      });

      toast({
        title: "Resync complete!",
        description: `Found ${data.gamesFound} games, ${data.gamesInserted} new.`,
      });

      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["game-counts"] });

      await runAnalysisPipeline();
    } catch (err: any) {
      setSyncState({ loading: false, error: err.message || "Resync failed", result: null });
    }
  };

  const isConnected = (platform: Platform) => {
    if (!profile) return false;
    return platform === "chesscom" ? !!profile.chesscom_username : !!profile.lichess_username;
  };

  const getUsername = (platform: Platform) => {
    if (!profile) return null;
    return platform === "chesscom" ? profile.chesscom_username : profile.lichess_username;
  };

  const renderSyncProgress = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="px-6 pb-6 pt-0">
        <div className="border-t border-border pt-4">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {analysisState.running
                  ? "Analyzing games…"
                  : syncState.result && !analysisState.running && syncProgress >= 100
                    ? "Complete!"
                    : "Syncing games..."}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {Math.round(syncProgress)}%
              </span>
            </div>
            <Progress value={syncProgress} className="h-2" />
            {analysisState.detail && (
              <p className="text-xs text-muted-foreground/70 mt-1.5">{analysisState.detail}</p>
            )}
          </div>

          {/* Steps list */}
          <div className="space-y-2">
            {SYNC_STEPS.map((step, i) => {
              const Icon = step.icon;
              let status: "pending" | "active" | "done" = "pending";
              if (i < activeStepIndex) status = "done";
              else if (i === activeStepIndex && (syncState.loading || analysisState.running)) status = "active";
              else if (syncState.result && !analysisState.running && i < SYNC_STEPS.length) status = "done";

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors ${
                    status === "active" ? "bg-primary/5" : ""
                  }`}
                >
                  {status === "done" ? (
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  ) : status === "active" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center">
                      <Icon className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                  )}
                  <span className={`text-sm ${
                    status === "done" ? "text-foreground" :
                    status === "active" ? "text-foreground font-medium" :
                    "text-muted-foreground/60"
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Result summary */}
          <AnimatePresence>
            {syncState.result && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
              >
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {syncState.result.gamesFound} games found, {syncState.result.gamesInserted} imported
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  const renderPlatformCard = (platform: Platform, name: string, logo: string, desc: string) => {
    const connected = isConnected(platform);
    const connectedUsername = getUsername(platform);
    const count = gameCounts?.[platform] ?? 0;
    const isExpanded = expandedPlatform === platform;
    const showProgressPanel = isExpanded && (syncState.loading || syncState.result);

    return (
      <motion.div
        key={platform}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: platform === "lichess" ? 0.05 : 0 }}
        className={`rounded-xl border bg-card overflow-hidden transition-colors ${
          connected ? "border-primary/30" : "border-border"
        }`}
      >
        <button
          onClick={() => {
            if (!connected && !syncState.loading) {
              setExpandedPlatform(isExpanded ? null : platform);
              setSyncState({ loading: false, error: null, result: null });
              setUsername("");
            }
          }}
          className={`w-full p-6 text-left ${!connected && !syncState.loading ? "hover:bg-muted/30" : ""} transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt={name} className="w-12 h-12 rounded-lg object-contain" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{name}</h3>
                  {connected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
                {connected ? (
                  <p className="text-sm text-muted-foreground">
                    {connectedUsername} · {count} game{count !== 1 ? "s" : ""} imported
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{desc}</p>
                )}
              </div>
            </div>

            {connected && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1"
                  onClick={(e) => { e.stopPropagation(); handleResync(platform); }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncState.loading && isExpanded ? "animate-spin" : ""}`} />
                  Resync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive gap-1"
                  onClick={(e) => { e.stopPropagation(); handleDisconnect(platform); }}
                >
                  <Unlink className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </button>

        <AnimatePresence>
          {/* Username input (not connected, not syncing) */}
          {isExpanded && !connected && !syncState.loading && !syncState.result && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0">
                <div className="border-t border-border pt-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {name} Username
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Enter your ${name} username`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleConnect(platform)}
                      disabled={syncState.loading}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleConnect(platform)}
                      disabled={!username.trim() || syncState.loading}
                    >
                      Connect
                    </Button>
                  </div>
                  {syncState.error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive mt-2 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> {syncState.error}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress panel (syncing or just completed) */}
          {showProgressPanel && renderSyncProgress()}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Connect Your Account</h1>
        <p className="text-muted-foreground mb-8">
          Link your chess platform to import games and generate personalized drill decks.
        </p>

        <div className="grid gap-4">
          {renderPlatformCard("chesscom", "Chess.com", "/chesscom-logo.png", "Enter your username to import games")}
          {renderPlatformCard("lichess", "Lichess", "/lichess-logo.png", "Enter your username to import games")}
        </div>

        <p className="text-xs text-muted-foreground/60 mt-6 text-center">
          We only read your game history. No moves are made on your behalf.
        </p>

        {profile?.last_sync_at && (
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">
            Last synced: {new Date(profile.last_sync_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
