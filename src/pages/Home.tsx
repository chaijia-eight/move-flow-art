import { useEffect, useState } from "react";
import GameReviewWorkspace, { type ReviewGame, type ReviewPosition, type Weakness } from "@/components/GameReviewWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeAndDetect } from "@/lib/analyzeAndDetect";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<ReviewGame[]>([]);
  const [positions, setPositions] = useState<ReviewPosition[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDetail, setAnalysisDetail] = useState("");

  const loadWorkspace = async () => {
    if (!user) return;
    setLoading(true);

    const [gamesResult, positionsResult, weaknessesResult] = await Promise.all([
      supabase
        .from("user_games")
        .select("id, platform, opponent, result, played_at, analyzed, pgn")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false, nullsFirst: false })
        .limit(12),
      supabase
        .from("user_positions")
        .select("id, fen, category, move_number, engine_best_san, your_move_san, difficulty_score, drilled, eval_before, eval_after")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(24),
      supabase
        .from("user_weaknesses")
        .select("weakness_tag, severity_score, times_missed")
        .eq("user_id", user.id)
        .order("severity_score", { ascending: false })
        .limit(5),
    ]);

    setGames((gamesResult.data ?? []) as ReviewGame[]);
    setPositions((positionsResult.data ?? []) as ReviewPosition[]);
    setWeaknesses((weaknessesResult.data ?? []) as Weakness[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadWorkspace();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    void trackEvent("game_review_view", { surface: "chesscom_style_review" });
  }, [user?.id]);

  const handleAnalyze = async () => {
    if (!user) return;
    setAnalyzing(true);
    setAnalysisDetail("Loading games…");
    try {
      const result = await analyzeAndDetect(user.id, (progress) => {
        if (progress.phase === "analyzing") {
          setAnalysisDetail(`Analyzing game ${progress.gameIndex + 1} of ${progress.totalGames}…`);
        } else if (progress.phase === "detecting") {
          setAnalysisDetail("Updating weakness map…");
        }
      });

      toast({
        title: "Game review updated",
        description: `Found ${result.positionsFound} critical positions · updated ${result.weaknessesUpdated} weaknesses.`,
      });
      await loadWorkspace();
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error?.message ?? "Try again after syncing your games.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setAnalysisDetail("");
    }
  };

  return (
    <GameReviewWorkspace
      games={games}
      positions={positions}
      weaknesses={weaknesses}
      loading={loading}
      analyzing={analyzing}
      analysisDetail={analysisDetail}
      onAnalyze={handleAnalyze}
    />
  );
}
