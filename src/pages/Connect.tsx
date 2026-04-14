import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, RefreshCw, X, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type Platform = "chesscom" | "lichess";

interface SyncState {
  loading: boolean;
  error: string | null;
  result: { gamesFound: number; gamesInserted: number } | null;
}

export default function Connect() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>(null);
  const [username, setUsername] = useState("");
  const [syncState, setSyncState] = useState<SyncState>({ loading: false, error: null, result: null });

  // Fetch existing profile
  const { data: profile, isLoading: profileLoading } = useQuery({
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
      const { data: chesscom } = await supabase
        .from("user_games")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("platform", "chesscom");
      const { data: lichess } = await supabase
        .from("user_games")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("platform", "lichess");
      return { chesscom: chesscom?.length ?? 0, lichess: lichess?.length ?? 0 };
    },
  });

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
      setTimeout(() => setExpandedPlatform(null), 2000);
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

    const field = platform === "chesscom" ? "chesscom_username" : "lichess_username";

    await supabase
      .from("user_games")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    await supabase
      .from("user_profiles")
      .update({ [field]: null })
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

  const renderPlatformCard = (platform: Platform, name: string, logo: string, desc: string) => {
    const connected = isConnected(platform);
    const connectedUsername = getUsername(platform);
    const count = gameCounts?.[platform] ?? 0;
    const isExpanded = expandedPlatform === platform;

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
            if (!connected) {
              setExpandedPlatform(isExpanded ? null : platform);
              setSyncState({ loading: false, error: null, result: null });
              setUsername("");
            }
          }}
          className={`w-full p-6 text-left ${!connected ? "hover:bg-muted/30" : ""} transition-colors`}
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
                    {connectedUsername} · {count} games imported
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

        {/* Expanded input area */}
        <AnimatePresence>
          {isExpanded && !connected && (
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
                      className="gap-2"
                    >
                      {syncState.loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>

                  {/* Error */}
                  {syncState.error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive mt-2 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> {syncState.error}
                    </motion.p>
                  )}

                  {/* Success */}
                  {syncState.result && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-primary mt-2 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Found {syncState.result.gamesFound} games!
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resync status for connected platforms */}
        <AnimatePresence>
          {isExpanded && connected && syncState.loading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing new games...
                </div>
              </div>
            </motion.div>
          )}
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
          {renderPlatformCard(
            "chesscom",
            "Chess.com",
            "/chesscom-logo.png",
            "Enter your username to import games"
          )}
          {renderPlatformCard(
            "lichess",
            "Lichess",
            "/lichess-logo.png",
            "Enter your username to import games"
          )}
        </div>

        <p className="text-xs text-muted-foreground/60 mt-6 text-center">
          We only read your game history. No moves are made on your behalf.
        </p>

        {/* Last synced info */}
        {profile?.last_sync_at && (
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">
            Last synced: {new Date(profile.last_sync_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
