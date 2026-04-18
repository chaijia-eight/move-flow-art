import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileSearch, Link2, Database, Hand, Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chess } from "chess.js";
import Chessboard from "@/components/Chessboard";
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";
import {
  CLASSIFICATION_META,
  cpToWinPct,
  type Classification,
  type ReviewSummary,
} from "@/lib/reviewClassifier";
import { analyzePgnForReview } from "@/lib/reviewAnalyzer";
import { fetchPgnFromUrl } from "@/lib/pgnFetcher";
import type { MoveCategory } from "@/data/openings";

type Phase = "input" | "analyzing" | "review";

export default function Review() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("input");
  const [progress, setProgress] = useState({ ply: 0, total: 0 });
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [selectedPly, setSelectedPly] = useState(0);

  // Input state
  const [pgnText, setPgnText] = useState("");
  const [urlText, setUrlText] = useState("");

  // Live-board input mode — track FEN history so undo works
  const [liveFen, setLiveFen] = useState(() => new Chess().fen());
  const [liveMoves, setLiveMoves] = useState<string[]>([]);
  const [liveFenHistory, setLiveFenHistory] = useState<string[]>(() => [new Chess().fen()]);
  const liveBoard = useMemo(() => new Chess(liveFen), [liveFen]);

  // Synced games
  const { data: syncedGames } = useQuery({
    queryKey: ["review-games", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_games")
        .select("id, opponent, result, played_at, platform, pgn")
        .eq("user_id", user!.id)
        .not("pgn", "is", null)
        .order("played_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  // ------- Live board handlers -------
  const handleLiveMove = (from: string, to: string, san: string) => {
    const next = new Chess(liveFen);
    const r = next.move({ from, to, promotion: "q" });
    if (!r) return;
    setLiveFen(next.fen());
    setLiveMoves((m) => [...m, r.san]);
    setLiveFenHistory((h) => [...h, next.fen()]);
  };

  const undoLive = () => {
    setLiveFenHistory((h) => {
      if (h.length <= 1) return h;
      const newHist = h.slice(0, -1);
      setLiveFen(newHist[newHist.length - 1]);
      setLiveMoves((m) => m.slice(0, -1));
      return newHist;
    });
  };

  const liveMoveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    try {
      const moves = liveBoard.moves({ verbose: true });
      for (const m of moves) {
        if (!hints.has(m.from)) {
          hints.set(m.from, { category: "main_line" as MoveCategory, targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main_line" as MoveCategory);
      }
    } catch {}
    return hints;
  }, [liveFen]);

  const livePgn = useMemo(() => {
    if (liveMoves.length === 0) return "";
    let out = "";
    for (let i = 0; i < liveMoves.length; i += 2) {
      out += `${i / 2 + 1}. ${liveMoves[i]}${liveMoves[i + 1] ? " " + liveMoves[i + 1] : ""} `;
    }
    return out.trim();
  }, [liveMoves]);

  // ------- Analyze -------
  async function runAnalysis(pgn: string) {
    if (!pgn.trim()) {
      toast({ title: "No PGN", description: "Provide a game first.", variant: "destructive" });
      return;
    }
    setPhase("analyzing");
    setProgress({ ply: 0, total: 0 });
    try {
      const result = await analyzePgnForReview(pgn, (p) => {
        setProgress({ ply: p.ply, total: p.totalPlies });
      });
      setSummary(result);
      setSelectedPly(result.moves.length - 1);
      setPhase("review");
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e?.message ?? "Unknown error", variant: "destructive" });
      setPhase("input");
    }
  }

  async function handleUrlAnalyze() {
    try {
      const pgn = await fetchPgnFromUrl(urlText);
      await runAnalysis(pgn);
    } catch (e: any) {
      toast({ title: "Couldn't fetch game", description: e?.message ?? "Try pasting the PGN instead.", variant: "destructive" });
    }
  }

  // Keyboard nav in review
  useEffect(() => {
    if (phase !== "review" || !summary) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedPly((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedPly((i) => Math.min(summary.moves.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, summary]);

  // ====== RENDERERS ======

  if (phase === "analyzing") {
    const pct = progress.total ? Math.round((progress.ply / progress.total) * 100) : 0;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-foreground font-medium">Analyzing… {progress.ply}/{progress.total} plies</p>
        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (phase === "review" && summary) {
    return <ReviewView summary={summary} selectedPly={selectedPly} setSelectedPly={setSelectedPly} onBack={() => { setSummary(null); setPhase("input"); }} />;
  }

  // === INPUT PHASE ===
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-primary" /> Game Review
            </h1>
            <p className="text-sm text-muted-foreground">Get a chess.com-style review of any game.</p>
          </div>
        </div>

        <Tabs defaultValue="board" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="board"><Hand className="w-4 h-4 mr-1" /> Board</TabsTrigger>
            <TabsTrigger value="pgn">PGN</TabsTrigger>
            <TabsTrigger value="url"><Link2 className="w-4 h-4 mr-1" /> URL</TabsTrigger>
            <TabsTrigger value="synced"><Database className="w-4 h-4 mr-1" /> Synced</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">Play out the moves for both sides, then analyze.</p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
              <div className="aspect-square w-full max-w-[480px]">
                <Chessboard
                  fen={liveFen}
                  onMove={handleLiveMove}
                  moveHints={liveMoveHints}
                  playerColor={liveBoard.turn()}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground mb-1">Turn</p>
                  <p className="font-medium text-foreground">{liveBoard.turn() === "w" ? "White" : "Black"} to move</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 max-h-[180px] overflow-auto">
                  <p className="text-xs text-muted-foreground mb-1">Moves ({liveMoves.length})</p>
                  <p className="font-mono text-xs text-foreground break-words">{livePgn || "—"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={undoLive} disabled={!liveMoves.length}>Undo</Button>
                <Button onClick={() => runAnalysis(livePgn)} disabled={liveMoves.length < 2}>
                  <Play className="w-4 h-4 mr-1" /> Analyze
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pgn" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">Paste a PGN.</p>
            <Textarea
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              placeholder='[Event "..."]&#10;1. e4 e5 2. Nf3 ...'
              className="min-h-[240px] font-mono text-xs"
            />
            <Button className="mt-3" onClick={() => runAnalysis(pgnText)} disabled={!pgnText.trim()}>
              <Play className="w-4 h-4 mr-1" /> Analyze
            </Button>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">Paste a Chess.com or Lichess game link.</p>
            <Input
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="https://lichess.org/abcd1234  or  https://www.chess.com/game/live/12345..."
            />
            <Button className="mt-3" onClick={handleUrlAnalyze} disabled={!urlText.trim()}>
              <Play className="w-4 h-4 mr-1" /> Fetch & Analyze
            </Button>
          </TabsContent>

          <TabsContent value="synced" className="mt-4">
            {!syncedGames?.length ? (
              <p className="text-sm text-muted-foreground">No synced games. <button className="underline" onClick={() => navigate("/connect")}>Connect an account</button> first.</p>
            ) : (
              <ScrollArea className="h-[400px] rounded-lg border border-border">
                <div className="divide-y divide-border">
                  {syncedGames.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => runAnalysis(g.pgn)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3"
                    >
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        g.result === "win" ? "bg-emerald-500/15 text-emerald-400" :
                        g.result === "loss" ? "bg-red-500/15 text-red-400" :
                        "bg-muted text-muted-foreground"
                      }`}>{g.result ?? "—"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">vs {g.opponent ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{g.platform} · {g.played_at ? new Date(g.played_at).toLocaleDateString() : ""}</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===================== Review subview =====================

function ReviewView({
  summary,
  selectedPly,
  setSelectedPly,
  onBack,
}: {
  summary: ReviewSummary;
  selectedPly: number;
  setSelectedPly: (i: number) => void;
  onBack: () => void;
}) {
  const move = summary.moves[selectedPly];
  const meta = CLASSIFICATION_META[move.classification];

  // Position FEN to display = fen AFTER the selected move
  const displayFen = useMemo(() => {
    try {
      const c = new Chess(move.fenBefore);
      c.move(move.san);
      return c.fen();
    } catch {
      return move.fenBefore;
    }
  }, [move]);

  const chartData = useMemo(() => {
    return summary.moves.map((m, i) => ({
      ply: i + 1,
      white: cpToWinPct(m.evalAfter),
    }));
  }, [summary]);

  const movesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    movesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedPly]);

  const pairs: { num: number; white?: typeof move; black?: typeof move; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < summary.moves.length; i += 2) {
    pairs.push({
      num: i / 2 + 1,
      white: summary.moves[i],
      black: summary.moves[i + 1],
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" /> Game Review
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Board + chart */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square w-full max-w-[560px] mx-auto">
              <Chessboard
                fen={displayFen}
                onMove={() => {}}
                moveHints={new Map()}
                disabled
                highlightSquare={null}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPly(Math.max(0, selectedPly - 1))} disabled={selectedPly === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: meta.color + "22", color: meta.color }}
                >
                  <span>{Math.ceil((selectedPly + 1) / 2)}{move.color === "w" ? "." : "..."} {move.san}</span>
                  <span>{meta.symbol} {meta.label}</span>
                </div>
                {move.uci !== move.bestUci && (
                  <p className="text-xs text-muted-foreground mt-1">Engine preferred: <span className="text-foreground font-mono">{move.bestSan}</span></p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPly(Math.min(summary.moves.length - 1, selectedPly + 1))} disabled={selectedPly === summary.moves.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Eval chart */}
            <div className="rounded-xl border border-border bg-card p-3 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} onClick={(e: any) => {
                  if (e?.activeLabel) setSelectedPly((e.activeLabel as number) - 1);
                }}>
                  <XAxis dataKey="ply" hide />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <ReferenceLine x={selectedPly + 1} stroke="hsl(var(--primary))" />
                  <ReTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                    formatter={(v: any) => [`${Math.round(v)}% white`, "Eval"]}
                    labelFormatter={(l) => `Ply ${l}`}
                  />
                  <Line type="monotone" dataKey="white" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right panel — accuracy + move list */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <AccuracyCard label="White" accuracy={summary.whiteAccuracy} counts={summary.counts.white} />
              <AccuracyCard label="Black" accuracy={summary.blackAccuracy} counts={summary.counts.black} />
            </div>

            <div className="rounded-xl border border-border bg-card p-3 flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Moves</h3>
              <ScrollArea className="flex-1 h-[420px]">
                <div className="space-y-0.5 text-sm font-mono">
                  {pairs.map((p) => (
                    <div key={p.num} className="flex gap-2 items-center">
                      <span className="text-muted-foreground w-6 text-right">{p.num}.</span>
                      {p.white && (
                        <MoveChip move={p.white} active={selectedPly === p.whiteIdx} onClick={() => setSelectedPly(p.whiteIdx)} />
                      )}
                      {p.black && (
                        <MoveChip move={p.black} active={selectedPly === p.blackIdx} onClick={() => setSelectedPly(p.blackIdx)} />
                      )}
                    </div>
                  ))}
                  <div ref={movesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoveChip({ move, active, onClick }: { move: any; active: boolean; onClick: () => void }) {
  const meta = CLASSIFICATION_META[move.classification as Classification];
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all ${
        active ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary/50"
      }`}
      style={{ color: meta.color }}
      title={meta.label}
    >
      <span className="text-foreground">{move.san}</span>
      {meta.symbol && <span className="text-xs">{meta.symbol}</span>}
    </button>
  );
}

function AccuracyCard({ label, accuracy, counts }: { label: string; accuracy: number; counts: Record<Classification, number> }) {
  const order: Classification[] = ["brilliant", "great", "best", "excellent", "good", "inaccuracy", "mistake", "blunder"];
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label} accuracy</p>
      <p className="text-2xl font-bold text-foreground">{accuracy.toFixed(1)}<span className="text-base text-muted-foreground">%</span></p>
      <div className="mt-2 space-y-0.5">
        {order.map((k) => counts[k] > 0 && (
          <div key={k} className="flex items-center justify-between text-xs">
            <span style={{ color: CLASSIFICATION_META[k].color }}>{CLASSIFICATION_META[k].label}</span>
            <span className="text-foreground font-mono">{counts[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
