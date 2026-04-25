import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Gamepad2,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Chessboard from "@/components/Chessboard";
import { Button } from "@/components/ui/button";

export interface ReviewGame {
  id: string;
  platform: string;
  opponent: string | null;
  result: string | null;
  played_at: string | null;
  analyzed: boolean;
  pgn: string | null;
}

export interface ReviewPosition {
  id: string;
  fen: string;
  category: string;
  move_number: number;
  engine_best_san: string | null;
  your_move_san: string | null;
  difficulty_score: number | null;
  drilled: boolean;
  eval_before?: number | null;
  eval_after?: number | null;
}

export interface Weakness {
  weakness_tag: string;
  severity_score: number;
  times_missed: number;
}

interface GameReviewWorkspaceProps {
  games: ReviewGame[];
  positions: ReviewPosition[];
  weaknesses: Weakness[];
  loading: boolean;
  analyzing: boolean;
  analysisDetail: string;
  onAnalyze: () => void;
}

interface ReviewMove {
  key: string;
  moveNumber: number;
  isWhite: boolean;
  san: string;
  fen: string;
  category: string | null;
  position: ReviewPosition | null;
  evalAfter: number | null;
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

function normalizeSan(san: string | null | undefined): string {
  return (san ?? "").replace(/[+#?!]/g, "").trim();
}

function labelForCategory(category: string | null | undefined): string {
  switch (category) {
    case "blunder":
      return "Miss";
    case "missed_tactic":
      return "Missed win";
    case "defensive_crux":
      return "Mistake";
    case "endgame_tech":
      return "Inaccuracy";
    default:
      return "Good";
  }
}

function toneForCategory(category: string | null | undefined): string {
  switch (category) {
    case "blunder":
      return "border-destructive/50 bg-destructive/15 text-destructive";
    case "missed_tactic":
      return "border-primary/50 bg-primary/15 text-primary";
    case "defensive_crux":
      return "border-accent/50 bg-accent/15 text-accent-foreground";
    case "endgame_tech":
      return "border-muted-foreground/40 bg-muted text-muted-foreground";
    default:
      return "border-border bg-secondary text-secondary-foreground";
  }
}

function buildReviewMoves(game: ReviewGame | undefined, positions: ReviewPosition[]): ReviewMove[] {
  const byMove = new Map<string, ReviewPosition>();
  positions.forEach((position) => {
    const colorKeys = ["w", "b"];
    colorKeys.forEach((color) => byMove.set(`${position.move_number}-${color}-${normalizeSan(position.your_move_san)}`, position));
  });

  if (game?.pgn) {
    try {
      const parsed = new Chess();
      parsed.loadPgn(game.pgn);
      const moves = parsed.history({ verbose: true });
      const replay = new Chess();

      return moves.map((move, index) => {
        const fen = replay.fen();
        const isWhite = move.color === "w";
        const moveNumber = Math.floor(index / 2) + 1;
        const matched =
          byMove.get(`${moveNumber}-${move.color}-${normalizeSan(move.san)}`) ??
          positions.find(
            (position) =>
              position.move_number === moveNumber && normalizeSan(position.your_move_san) === normalizeSan(move.san),
          ) ??
          null;
        replay.move(move.san);

        return {
          key: `${moveNumber}-${move.color}-${move.san}-${index}`,
          moveNumber,
          isWhite,
          san: move.san,
          fen,
          category: matched?.category ?? null,
          position: matched,
          evalAfter: matched?.eval_after ?? null,
        };
      });
    } catch {
      return [];
    }
  }

  return positions.map((position, index) => ({
    key: position.id,
    moveNumber: position.move_number,
    isWhite: index % 2 === 0,
    san: position.your_move_san ?? "—",
    fen: position.fen,
    category: position.category,
    position,
    evalAfter: position.eval_after ?? null,
  }));
}

function calculateAccuracy(positions: ReviewPosition[], totalMoves: number): number {
  if (!totalMoves) return positions.length ? 72 : 100;
  const penalty = positions.reduce((sum, position) => sum + Math.max(1, position.difficulty_score ?? 4), 0);
  return Math.max(1, Math.min(99, Math.round(100 - (penalty / Math.max(12, totalMoves)) * 12)));
}

export default function GameReviewWorkspace({
  games,
  positions,
  weaknesses,
  loading,
  analyzing,
  analysisDetail,
  onAnalyze,
}: GameReviewWorkspaceProps) {
  const latestGame = games[0];
  const reviewMoves = useMemo(() => buildReviewMoves(latestGame, positions), [latestGame, positions]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setShowAnswer(false);
  }, [latestGame?.id, positions.length]);

  const selectedMove = reviewMoves[selectedIndex] ?? reviewMoves[0] ?? null;
  const selectedPosition = selectedMove?.position ?? positions[0] ?? null;
  const boardFen = useMemo(() => toPlayableFen(selectedMove?.fen ?? selectedPosition?.fen), [selectedMove?.fen, selectedPosition?.fen]);
  const analyzedCount = games.filter((game) => game.analyzed).length;
  const pendingCount = games.length - analyzedCount;
  const openMistakes = positions.filter((position) => !position.drilled).length;
  const accuracy = calculateAccuracy(positions, reviewMoves.length);
  const missedWins = positions.filter((position) => position.category === "missed_tactic").length;

  const goToMove = (offset: number) => {
    if (!reviewMoves.length) return;
    setSelectedIndex((current) => Math.max(0, Math.min(reviewMoves.length - 1, current + offset)));
    setShowAnswer(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">ArcChess Game Review</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Review every swing in the game.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Step through the move list, inspect critical moments, and reveal the engine answer when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="depth-button">
              <Link to="/connect">
                <Database className="mr-2 h-4 w-4" /> Sync games
              </Link>
            </Button>
            <Button onClick={onAnalyze} disabled={analyzing} className="depth-button">
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric icon={<BarChart3 className="h-4 w-4" />} label="Accuracy" value={`${accuracy}%`} />
          <Metric icon={<Zap className="h-4 w-4" />} label="Critical" value={openMistakes} />
          <Metric icon={<Target className="h-4 w-4" />} label="Missed wins" value={missedWins} />
          <Metric icon={<Gamepad2 className="h-4 w-4" />} label="Pending" value={pendingCount} />
        </section>

        {analyzing && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground depth-card">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-primary" />
            {analysisDetail || "Analyzing…"}
          </div>
        )}

        <section className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[560px] flex-col rounded-lg border border-border bg-card p-4 shadow-lg depth-card"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">
                  {latestGame ? `vs ${latestGame.opponent ?? "unknown opponent"}` : "Game review"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {latestGame ? `${latestGame.platform} · ${latestGame.result ?? "Result unknown"}` : "Sync a game to generate a full review."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconButton label="Previous move" onClick={() => goToMove(-1)} disabled={!selectedIndex}>
                  <ChevronLeft className="h-4 w-4" />
                </IconButton>
                <span className="min-w-20 rounded-md border border-border bg-secondary px-3 py-2 text-center font-mono text-sm text-secondary-foreground">
                  {selectedMove ? `${selectedMove.moveNumber}${selectedMove.isWhite ? "." : "..."}` : "—"}
                </span>
                <IconButton label="Next move" onClick={() => goToMove(1)} disabled={selectedIndex >= reviewMoves.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex items-center justify-center rounded-lg border border-border bg-background p-3">
                <div className="aspect-square w-full max-w-[590px]">
                  <Chessboard fen={boardFen} onMove={() => undefined} moveHints={new Map()} disabled playerColor="w" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <ReviewCoachCard selectedMove={selectedMove} selectedPosition={selectedPosition} showAnswer={showAnswer} onShowAnswer={() => setShowAnswer(true)} />
                <Panel title="Eval swing" action={selectedPosition?.category ? labelForCategory(selectedPosition.category) : undefined}>
                  <EvalSparkline moves={reviewMoves} selectedIndex={selectedIndex} />
                </Panel>
                <Panel title="Weaknesses" action={weaknesses.length ? "Live" : undefined}>
                  {loading ? <LoadingLine /> : weaknesses.length ? <WeaknessList weaknesses={weaknesses} /> : <EmptyState text="Analyze games to map recurring weakness tags." />}
                </Panel>
              </div>
            </div>
          </motion.div>

          <aside className="flex min-h-[560px] flex-col rounded-lg border border-border bg-card p-4 shadow-lg depth-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Move list</h2>
                <p className="text-sm text-muted-foreground">Chess.com-style review timeline</p>
              </div>
              <span className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                {reviewMoves.length || positions.length} moves
              </span>
            </div>

            {loading ? (
              <LoadingLine />
            ) : reviewMoves.length === 0 ? (
              <EmptyState text="No review data yet. Sync and analyze your games to populate the move list." />
            ) : (
              <MoveList moves={reviewMoves} selectedIndex={selectedIndex} onSelect={(index) => { setSelectedIndex(index); setShowAnswer(false); }} />
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <MiniStat label="Games" value={games.length} />
              <MiniStat label="Analyzed" value={analyzedCount} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ReviewCoachCard({
  selectedMove,
  selectedPosition,
  showAnswer,
  onShowAnswer,
}: {
  selectedMove: ReviewMove | null;
  selectedPosition: ReviewPosition | null;
  showAnswer: boolean;
  onShowAnswer: () => void;
}) {
  const category = selectedPosition?.category ?? selectedMove?.category;

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-md depth-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-wider ${toneForCategory(category)}`}>
          {labelForCategory(category)}
        </span>
        {selectedPosition?.difficulty_score && <span className="text-xs font-semibold text-muted-foreground">Depth {selectedPosition.difficulty_score}/10</span>}
      </div>
      <div className="space-y-2 text-sm">
        <Insight label="Played" value={selectedPosition?.your_move_san ?? selectedMove?.san ?? "—"} />
        <Insight label="Best" value={showAnswer ? selectedPosition?.engine_best_san ?? "No engine move saved" : "Hidden"} emphasized={showAnswer} />
      </div>
      <Button onClick={onShowAnswer} variant="secondary" className="mt-3 w-full depth-button" disabled={showAnswer || !selectedPosition}>
        <Eye className="mr-2 h-4 w-4" />
        {showAnswer ? "Answer shown" : "Show answer"}
      </Button>
    </section>
  );
}

function MoveList({ moves, selectedIndex, onSelect }: { moves: ReviewMove[]; selectedIndex: number; onSelect: (index: number) => void }) {
  const pairs: { number: number; white?: ReviewMove & { index: number }; black?: ReviewMove & { index: number } }[] = [];
  moves.forEach((move, index) => {
    if (move.isWhite) {
      pairs.push({ number: move.moveNumber, white: { ...move, index } });
    } else if (pairs.length && !pairs[pairs.length - 1].black) {
      pairs[pairs.length - 1].black = { ...move, index };
    } else {
      pairs.push({ number: move.moveNumber, black: { ...move, index } });
    }
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="space-y-1">
        {pairs.map((pair) => (
          <div key={pair.number} className="grid grid-cols-[38px_1fr_1fr] items-center gap-2 text-sm">
            <span className="text-right font-mono text-xs text-muted-foreground">{pair.number}.</span>
            <MoveButton move={pair.white} selectedIndex={selectedIndex} onSelect={onSelect} />
            <MoveButton move={pair.black} selectedIndex={selectedIndex} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MoveButton({
  move,
  selectedIndex,
  onSelect,
}: {
  move?: ReviewMove & { index: number };
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (!move) return <span />;

  return (
    <button
      type="button"
      onClick={() => onSelect(move.index)}
      className={`flex min-h-10 items-center justify-between gap-2 rounded-md border px-2 py-2 text-left transition-all depth-button ${
        selectedIndex === move.index ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
      }`}
    >
      <span className="truncate font-mono text-sm font-semibold">{move.san}</span>
      {move.category && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${move.category === "blunder" ? "bg-destructive" : "bg-primary"}`} />}
    </button>
  );
}

function EvalSparkline({ moves, selectedIndex }: { moves: ReviewMove[]; selectedIndex: number }) {
  const points = moves.length ? moves.slice(0, 32) : [];

  if (!points.length) return <EmptyState text="Evaluation appears after game analysis." />;

  return (
    <div className="flex h-24 items-end gap-1 rounded-md border border-border bg-background p-2">
      {points.map((move, index) => {
        const raw = move.evalAfter ?? (move.position ? -(move.position.difficulty_score ?? 1) / 2 : 0);
        const height = Math.max(12, Math.min(88, 48 + raw * 12));
        return (
          <button
            key={move.key}
            type="button"
            aria-label={`Evaluation move ${move.moveNumber}`}
            className={`w-full rounded-sm transition-all ${index === selectedIndex ? "bg-primary" : move.category ? "bg-destructive/70" : "bg-muted-foreground/40"}`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

function WeaknessList({ weaknesses }: { weaknesses: Weakness[] }) {
  return (
    <div className="space-y-3">
      {weaknesses.slice(0, 3).map((weakness) => (
        <div key={weakness.weakness_tag} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-card-foreground">{weakness.weakness_tag.replace(/_/g, " ")}</span>
            <span className="text-xs text-muted-foreground">{weakness.times_missed}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, weakness.severity_score * 10)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
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

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 depth-card">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-card-foreground">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-secondary-foreground">{value}</p>
    </div>
  );
}

function Insight({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${emphasized ? "text-primary" : "text-secondary-foreground"}`}>{value}</p>
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

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 depth-button"
    >
      {children}
    </button>
  );
}
