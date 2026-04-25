import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import { BarChart3, Brain, CheckCircle2, Database, Gamepad2, Loader2, RefreshCw, Target } from "lucide-react";
import Chessboard from "@/components/Chessboard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeAndDetect } from "@/lib/analyzeAndDetect";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

interface ReviewGame {
  id: string;
  platform: string;
  opponent: string | null;
  result: string | null;
  played_at: string | null;
  analyzed: boolean;
}

interface ReviewPosition {
  id: string;
  fen: string;
  category: string;
  move_number: number;
  engine_best_san: string | null;
  your_move_san: string | null;
  difficulty_score: number | null;
  drilled: boolean;
}

interface Weakness {
  weakness_tag: string;
  severity_score: number;
  times_missed: number;
}

const FALLBACK_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function toPlayableFen(fen: string | null | undefined): string {
  if (!fen) return FALLBACK_BOARD_FEN;
  try {
    new Chess(fen);
    return fen;
  } catch {
    return FALLBACK_BOARD_FEN;
  }
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<ReviewGame[]>([]);
  const [positions, setPositions] = useState<ReviewPosition[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDetail, setAnalysisDetail] = useState("");

  const selectedPosition = useMemo(
    () => positions.find((position) => position.id === selectedPositionId) ?? positions[0] ?? null,
    [positions, selectedPositionId],
  );
  const boardFen = useMemo(() => toPlayableFen(selectedPosition?.fen), [selectedPosition?.fen]);

  const latestGame = games[0];
  const analyzedCount = games.filter((game) => game.analyzed).length;
  const pendingCount = games.length - analyzedCount;
  const openMistakes = positions.filter((position) => !position.drilled).length;

  const loadWorkspace = async () => {
    if (!user) return;
    setLoading(true);

    const [gamesResult, positionsResult, weaknessesResult] = await Promise.all([
      supabase
        .from("user_games")
        .select("id, platform, opponent, result, played_at, analyzed")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false, nullsFirst: false })
        .limit(12),
      supabase
        .from("user_positions")
        .select("id, fen, category, move_number, engine_best_san, your_move_san, difficulty_score, drilled")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("user_weaknesses")
        .select("weakness_tag, severity_score, times_missed")
        .eq("user_id", user.id)
        .order("severity_score", { ascending: false })
        .limit(5),
    ]);

    setGames((gamesResult.data ?? []) as ReviewGame[]);
    const nextPositions = (positionsResult.data ?? []) as ReviewPosition[];
    setPositions(nextPositions);
    setSelectedPositionId((current) => current ?? nextPositions[0]?.id ?? null);
    setWeaknesses((weaknessesResult.data ?? []) as Weakness[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadWorkspace();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    void trackEvent("weakness_trend_view", { surface: "review_workspace" });
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
        title: "Review workspace updated",
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">ArcChess Review</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Turn your games into a training plan.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Sync your recent games, analyze the critical positions, then review the mistakes that matter most.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="depth-button">
              <Link to="/connect">
                <Database className="mr-2 h-4 w-4" /> Sync games
              </Link>
            </Button>
            <Button onClick={handleAnalyze} disabled={analyzing} className="depth-button">
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[520px] flex-col rounded-lg border border-border bg-card p-4 shadow-lg depth-card"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Critical position</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPosition ? `${selectedPosition.category.replace(/_/g, " ")} · move ${selectedPosition.move_number}` : "No analyzed position selected"}
                </p>
              </div>
              {selectedPosition && (
                <span className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                  {selectedPosition.drilled ? "Reviewed" : "Needs review"}
                </span>
              )}
            </div>

            <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-3">
              <div className="aspect-square w-full max-w-[560px]">
                <Chessboard
                  fen={boardFen}
                  onMove={() => undefined}
                  moveHints={new Map()}
                  disabled
                  playerColor="w"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Insight label="Your move" value={selectedPosition?.your_move_san ?? "—"} />
              <Insight label="Engine preferred" value={selectedPosition?.engine_best_san ?? "Analyze games first"} />
            </div>
          </motion.div>

          <aside className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Metric icon={<Gamepad2 className="h-4 w-4" />} label="Games" value={games.length} />
              <Metric icon={<Brain className="h-4 w-4" />} label="Mistakes" value={openMistakes} />
              <Metric icon={<BarChart3 className="h-4 w-4" />} label="Pending" value={pendingCount} />
            </div>

            {analyzing && (
              <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground depth-card">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-primary" />
                {analysisDetail || "Analyzing…"}
              </div>
            )}

            <Panel title="Review queue" action={positions.length ? `${positions.length} positions` : undefined}>
              {loading ? (
                <LoadingLine />
              ) : positions.length === 0 ? (
                <EmptyState text="No mistakes found yet. Sync and analyze your games to build a review queue." />
              ) : (
                <div className="space-y-2">
                  {positions.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => setSelectedPositionId(position.id)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition-all depth-button ${
                        position.id === selectedPosition?.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/60 text-secondary-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold capitalize">{position.category.replace(/_/g, " ")}</span>
                        <span className="text-xs text-muted-foreground">Move {position.move_number}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Best: {position.engine_best_san ?? "—"} · Played: {position.your_move_san ?? "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Weakness map" action={weaknesses.length ? "Live" : undefined}>
              {loading ? (
                <LoadingLine />
              ) : weaknesses.length === 0 ? (
                <EmptyState text="Your weakness map appears after analysis." />
              ) : (
                <div className="space-y-3">
                  {weaknesses.map((weakness) => (
                    <div key={weakness.weakness_tag} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-card-foreground">{weakness.weakness_tag.replace(/_/g, " ")}</span>
                        <span className="text-xs text-muted-foreground">{weakness.times_missed} misses</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, weakness.severity_score * 10)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Latest game" action={latestGame?.platform}>
              {loading ? (
                <LoadingLine />
              ) : latestGame ? (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-card-foreground">vs {latestGame.opponent ?? "unknown opponent"}</p>
                    <p className="text-muted-foreground">{latestGame.result ?? "Result unknown"} · {latestGame.analyzed ? "analyzed" : "waiting for analysis"}</p>
                  </div>
                </div>
              ) : (
                <EmptyState text="Connect Chess.com or Lichess to start reviewing real games." />
              )}
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-md depth-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-card-foreground">{title}</h2>
        {action && <span className="text-xs font-semibold text-primary">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3 depth-card">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-2xl font-bold text-card-foreground">{value}</div>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-secondary-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/70 px-3 py-3 text-sm text-muted-foreground">
      <Target className="mb-2 h-4 w-4 text-primary" />
      {text}
    </div>
  );
}

function LoadingLine() {
  return <div className="h-12 animate-pulse rounded-md bg-secondary" />;
}