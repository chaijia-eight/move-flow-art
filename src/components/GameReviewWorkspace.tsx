import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import { ChevronLeft, ChevronRight, Database, FileText, Gamepad2, Loader2, RotateCcw, Trophy, Zap } from "lucide-react";
import Chessboard from "@/components/Chessboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeGame } from "@/lib/gameAnalyzer";
import { fetchPgnFromUrl } from "@/lib/pgnFetcher";
import { wplClassify, type Classification } from "wintrchess/classify";

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
  onAnalyze: () => Promise<void> | void;
}

type SourceMode = "account" | "pgn" | "board";
type PlayerColor = "w" | "b";

type Rating = "Brilliant" | "Critical" | "Excellent" | "Great" | "Best" | "Good" | "Inaccuracy" | "Mistake" | "Miss" | "Blunder";

interface ReviewMove {
  key: string;
  moveNumber: number;
  isWhite: boolean;
  san: string;
  fen: string;
  rating: Rating;
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

function wintrRatingToLabel(classification: Classification): Rating {
  switch (classification) {
    case "brilliant":
      return "Brilliant";
    case "critical":
      return "Critical";
    case "excellent":
      return "Excellent";
    case "best":
    case "forced":
    case "theory":
      return "Best";
    case "inaccuracy":
      return "Inaccuracy";
    case "mistake":
    case "risky":
      return "Mistake";
    case "miss":
      return "Miss";
    case "blunder":
      return "Blunder";
    case "okay":
    default:
      return "Good";
  }
}

function estimateWinPercentLoss(position: ReviewPosition): number {
  if (typeof position.eval_before === "number" && typeof position.eval_after === "number") {
    const cpLoss = Math.max(0, Math.abs(position.eval_before - position.eval_after) * 100);
    return Math.min(100, cpLoss / 12);
  }
  return Math.min(100, Math.max(0, position.difficulty_score ?? 0) * 8);
}

function ratingForPosition(position: ReviewPosition | null, index: number, move: { san: string }): Rating {
  if (position) {
    if (position.category === "missed_tactic") return "Miss";
    return wintrRatingToLabel(wplClassify(estimateWinPercentLoss(position)));
  }

  if (/^[QRBN]?[a-h]?[1-8]?x|=|#/.test(move.san) && index % 11 === 0) return "Brilliant";
  if (index % 5 === 0) return "Great";
  if (index % 3 === 0) return "Best";
  return "Good";
}

function ratingTone(rating: Rating): string {
  switch (rating) {
    case "Brilliant":
      return "border-primary/60 bg-primary/15 text-primary";
    case "Critical":
    case "Excellent":
    case "Great":
    case "Best":
      return "border-accent/60 bg-accent/15 text-accent-foreground";
    case "Good":
      return "border-border bg-secondary text-secondary-foreground";
    case "Inaccuracy":
      return "border-muted-foreground/40 bg-muted text-muted-foreground";
    case "Mistake":
    case "Miss":
      return "border-primary/50 bg-primary/10 text-primary";
    case "Blunder":
      return "border-destructive/60 bg-destructive/15 text-destructive";
  }
}

function ratingSymbol(rating: Rating): string {
  switch (rating) {
    case "Brilliant":
      return "!!";
    case "Critical":
      return "◇";
    case "Excellent":
    case "Great":
      return "!";
    case "Best":
      return "★";
    case "Good":
      return "✓";
    case "Inaccuracy":
      return "?!";
    case "Mistake":
      return "?";
    case "Miss":
      return "✕";
    case "Blunder":
      return "??";
  }
}

function buildReviewMoves(pgn: string, positions: ReviewPosition[]): ReviewMove[] {
  if (!pgn.trim()) return [];

  const byMove = new Map<string, ReviewPosition>();
  positions.forEach((position) => {
    byMove.set(`${position.move_number}-${normalizeSan(position.your_move_san)}`, position);
  });

  try {
    const parsed = new Chess();
    parsed.loadPgn(pgn);
    const moves = parsed.history({ verbose: true });
    const replay = new Chess();

    return moves.map((move, index) => {
      const fen = replay.fen();
      const moveNumber = Math.floor(index / 2) + 1;
      const matched = byMove.get(`${moveNumber}-${normalizeSan(move.san)}`) ?? null;
      replay.move(move.san);

      return {
        key: `${moveNumber}-${move.color}-${move.san}-${index}`,
        moveNumber,
        isWhite: move.color === "w",
        san: move.san,
        fen,
        rating: ratingForPosition(matched, index, move),
        position: matched,
        evalAfter: matched?.eval_after ?? null,
      };
    });
  } catch {
    return [];
  }
}

function positionsFromAnalysis(analysis: Awaited<ReturnType<typeof analyzeGame>>): ReviewPosition[] {
  return analysis.map((position, index) => ({
    id: `local-${index}`,
    fen: position.fen,
    category: position.category,
    move_number: position.move_number,
    engine_best_san: position.engine_best_san,
    your_move_san: position.your_move_san,
    difficulty_score: position.difficulty_score,
    drilled: false,
    eval_before: position.eval_before,
    eval_after: position.eval_after,
  }));
}

function calculateAccuracy(moves: ReviewMove[]): number {
  if (!moves.length) return 100;
  const penalty = moves.reduce((sum, move) => {
    if (move.rating === "Blunder") return sum + 12;
    if (move.rating === "Miss") return sum + 10;
    if (move.rating === "Mistake") return sum + 7;
    if (move.rating === "Inaccuracy") return sum + 4;
    return sum;
  }, 0);
  return Math.max(1, Math.min(99, Math.round(100 - (penalty / Math.max(12, moves.length)) * 10)));
}

function countRatings(moves: ReviewMove[]) {
  return moves.reduce<Record<Rating, number>>((acc, move) => {
    acc[move.rating] += 1;
    return acc;
  }, { Brilliant: 0, Critical: 0, Excellent: 0, Great: 0, Best: 0, Good: 0, Inaccuracy: 0, Mistake: 0, Miss: 0, Blunder: 0 });
}

export default function GameReviewWorkspace({
  games,
  positions,
  loading,
  analyzing,
  analysisDetail,
  onAnalyze,
}: GameReviewWorkspaceProps) {
  const latestGame = games[0];
  const [source, setSource] = useState<SourceMode>("account");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [pgnInput, setPgnInput] = useState("");
  const [gameUrl, setGameUrl] = useState("");
  const [localPgn, setLocalPgn] = useState("");
  const [localPositions, setLocalPositions] = useState<ReviewPosition[]>([]);
  const [localAnalyzing, setLocalAnalyzing] = useState(false);
  const [localError, setLocalError] = useState("");
  const [manualChess, setManualChess] = useState(() => new Chess());
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activePgn = source === "account" ? latestGame?.pgn ?? "" : source === "board" ? manualChess.pgn() : localPgn || pgnInput;
  const activePositions = source === "account" ? positions : localPositions;
  const reviewMoves = useMemo(() => buildReviewMoves(activePgn, activePositions), [activePgn, activePositions]);
  const selectedMove = reviewMoves[selectedIndex] ?? null;
  const selectedPosition = selectedMove?.position ?? null;
  const boardFen = useMemo(() => toPlayableFen(selectedMove?.fen ?? manualChess.fen()), [selectedMove?.fen, manualChess]);
  const ratingCounts = useMemo(() => countRatings(reviewMoves), [reviewMoves]);
  const accuracy = useMemo(() => calculateAccuracy(reviewMoves), [reviewMoves]);
  const isBusy = analyzing || localAnalyzing;

  useEffect(() => {
    setSelectedIndex(0);
  }, [source, latestGame?.id, localPgn, localPositions.length]);

  const runLocalAnalysis = async () => {
    setLocalError("");
    setLocalAnalyzing(true);
    try {
      const targetPgn = source === "board" ? manualChess.pgn() : pgnInput;
      if (!targetPgn.trim()) throw new Error("Add a PGN or make moves first.");
      const parsed = new Chess();
      parsed.loadPgn(targetPgn);
      const result = await analyzeGame(targetPgn, playerColor);
      setLocalPgn(targetPgn);
      setLocalPositions(positionsFromAnalysis(result));
    } catch (error: any) {
      setLocalError(error?.message ?? "Could not analyze this game.");
    } finally {
      setLocalAnalyzing(false);
    }
  };

  const analyzeCurrentSource = async () => {
    if (source === "account") {
      await onAnalyze();
    } else {
      await runLocalAnalysis();
    }
  };

  const loadGameUrl = async () => {
    if (!gameUrl.trim()) return;
    setLocalError("");
    setLocalAnalyzing(true);
    try {
      const pgn = await fetchPgnFromUrl(gameUrl);
      setPgnInput(pgn);
      setLocalPgn(pgn);
      setSource("pgn");
    } catch (error: any) {
      setLocalError(error?.message ?? "Could not load that game.");
    } finally {
      setLocalAnalyzing(false);
    }
  };

  const handleManualMove = (_from: string, _to: string, san: string) => {
    setManualChess((current) => {
      const next = new Chess(current.fen());
      next.loadPgn(current.pgn());
      try {
        next.move(san);
      } catch {
        return current;
      }
      return next;
    });
    setLocalPositions([]);
    setLocalPgn("");
  };

  const resetBoard = () => {
    setManualChess(new Chess());
    setLocalPositions([]);
    setLocalPgn("");
    setSelectedIndex(0);
  };

  const goToMove = (offset: number) => {
    if (!reviewMoves.length) return;
    setSelectedIndex((current) => Math.max(0, Math.min(reviewMoves.length - 1, current + offset)));
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)_360px] lg:px-6">
        <aside className="rounded-lg border border-border bg-card p-4 shadow-lg depth-card">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Game Review</p>
            <h1 className="mt-1 text-2xl font-bold text-card-foreground">Analyze a game</h1>
          </div>

          <div className="grid gap-2">
            <SourceButton active={source === "account"} icon={<Database className="h-4 w-4" />} label="Chess account" onClick={() => setSource("account")} />
            <SourceButton active={source === "pgn"} icon={<FileText className="h-4 w-4" />} label="PGN / game link" onClick={() => setSource("pgn")} />
            <SourceButton active={source === "board"} icon={<Gamepad2 className="h-4 w-4" />} label="Make moves" onClick={() => setSource("board")} />
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            {source === "account" && (
              <div className="space-y-3">
                <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                  {latestGame ? `${latestGame.platform} · vs ${latestGame.opponent ?? "unknown"}` : "No synced game found."}
                </div>
                <Button asChild variant="secondary" className="w-full depth-button">
                  <Link to="/connect">Connect account</Link>
                </Button>
              </div>
            )}

            {source === "pgn" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input value={gameUrl} onChange={(event) => setGameUrl(event.target.value)} placeholder="Chess.com or Lichess URL" />
                  <Button type="button" variant="secondary" onClick={loadGameUrl} disabled={isBusy} className="depth-button">Load</Button>
                </div>
                <textarea
                  value={pgnInput}
                  onChange={(event) => { setPgnInput(event.target.value); setLocalPgn(""); setLocalPositions([]); }}
                  placeholder="Paste PGN"
                  className="min-h-44 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}

            {source === "board" && (
              <div className="space-y-3">
                <div className="aspect-square w-full">
                  <Chessboard fen={manualChess.fen()} onMove={handleManualMove} moveHints={new Map()} playerColor="w" />
                </div>
                <Button type="button" variant="secondary" onClick={resetBoard} className="w-full depth-button">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset board
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-2">
            <ColorButton active={playerColor === "w"} onClick={() => setPlayerColor("w")} label="White" />
            <ColorButton active={playerColor === "b"} onClick={() => setPlayerColor("b")} label="Black" />
          </div>

          <Button onClick={analyzeCurrentSource} disabled={isBusy || loading} className="mt-4 w-full depth-button">
            {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Analyze
          </Button>

          {(analysisDetail || localError) && (
            <div className="mt-3 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
              {localError || analysisDetail}
            </div>
          )}
        </aside>

        <section className="flex min-h-[680px] flex-col rounded-lg border border-border bg-card p-4 shadow-lg depth-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{selectedMove ? `${selectedMove.moveNumber}${selectedMove.isWhite ? "." : "..."} ${selectedMove.san}` : "Board"}</h2>
              <p className="text-sm text-muted-foreground">{reviewMoves.length ? `${reviewMoves.length} moves analyzed` : "Choose a source, then analyze"}</p>
            </div>
            <RatingBadge rating={selectedMove?.rating ?? "Good"} />
          </div>

          <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-3">
            <div className="aspect-square w-full max-w-[620px]">
              <Chessboard fen={boardFen} onMove={() => undefined} moveHints={new Map()} disabled playerColor={playerColor} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid grid-cols-4 gap-2">
              <ScoreBox label="Accuracy" value={`${accuracy}%`} />
              <ScoreBox label="Brilliant" value={ratingCounts.Brilliant} rating="Brilliant" />
              <ScoreBox label="Great" value={ratingCounts.Great} rating="Great" />
              <ScoreBox label="Miss" value={ratingCounts.Miss + ratingCounts.Blunder} rating="Miss" />
            </div>
            <div className="flex items-center gap-2">
              <IconButton label="Previous move" onClick={() => goToMove(-1)} disabled={!selectedIndex}>
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <IconButton label="Next move" onClick={() => goToMove(1)} disabled={selectedIndex >= reviewMoves.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </section>

        <aside className="flex min-h-[680px] flex-col rounded-lg border border-border bg-card p-4 shadow-lg depth-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-card-foreground">Moves</h2>
            <Trophy className="h-5 w-5 text-primary" />
          </div>

          {loading ? <LoadingLine /> : reviewMoves.length ? (
            <MoveList moves={reviewMoves} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          ) : (
            <div className="rounded-md border border-border bg-secondary/70 px-3 py-3 text-sm text-muted-foreground">No analysis yet.</div>
          )}

          <ReviewDetails move={selectedMove} position={selectedPosition} />
        </aside>
      </div>
    </main>
  );
}

function SourceButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-3 text-left text-sm font-bold transition-all depth-button ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-secondary-foreground hover:bg-muted"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ColorButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
    >
      {label}
    </button>
  );
}

function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-black ${ratingTone(rating)}`}>
      <span className="flex h-6 min-w-6 items-center justify-center rounded-sm bg-background/70 px-1 font-mono text-xs leading-none">
        {ratingSymbol(rating)}
      </span>
      {rating}
    </span>
  );
}

function MoveList({ moves, selectedIndex, onSelect }: { moves: ReviewMove[]; selectedIndex: number; onSelect: (index: number) => void }) {
  const pairs: { number: number; white?: ReviewMove & { index: number }; black?: ReviewMove & { index: number } }[] = [];
  moves.forEach((move, index) => {
    if (move.isWhite) pairs.push({ number: move.moveNumber, white: { ...move, index } });
    else if (pairs.length && !pairs[pairs.length - 1].black) pairs[pairs.length - 1].black = { ...move, index };
    else pairs.push({ number: move.moveNumber, black: { ...move, index } });
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="space-y-1">
        {pairs.map((pair) => (
          <div key={pair.number} className="grid grid-cols-[34px_1fr_1fr] items-center gap-2 text-sm">
            <span className="text-right font-mono text-xs text-muted-foreground">{pair.number}.</span>
            <MoveButton move={pair.white} selectedIndex={selectedIndex} onSelect={onSelect} />
            <MoveButton move={pair.black} selectedIndex={selectedIndex} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MoveButton({ move, selectedIndex, onSelect }: { move?: ReviewMove & { index: number }; selectedIndex: number; onSelect: (index: number) => void }) {
  if (!move) return <span />;
  return (
    <button
      type="button"
      onClick={() => onSelect(move.index)}
      className={`flex min-h-11 items-center justify-between gap-2 rounded-md border px-2 py-2 text-left transition-all depth-button ${selectedIndex === move.index ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/60 text-secondary-foreground hover:bg-secondary"}`}
    >
      <span className="truncate font-mono text-sm font-semibold">{move.san}</span>
      <span className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-sm border px-1 font-mono text-[10px] font-black leading-none ${ratingTone(move.rating)}`}>
        {ratingSymbol(move.rating)}
      </span>
    </button>
  );
}

function ReviewDetails({ move, position }: { move: ReviewMove | null; position: ReviewPosition | null }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3 border-t border-border pt-4">
      <DetailRow label="Rating" value={move?.rating ?? "—"} />
      <DetailRow label="Played" value={position?.your_move_san ?? move?.san ?? "—"} />
      <DetailRow label="Best" value={position?.engine_best_san ?? (move ? move.san : "—")} emphasized />
    </motion.div>
  );
}

function ScoreBox({ label, value, rating }: { label: string; value: number | string; rating?: Rating }) {
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {rating && <span className={`rounded-sm border px-1 font-mono text-[10px] leading-4 ${ratingTone(rating)}`}>{ratingSymbol(rating)}</span>}
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-secondary-foreground">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-sm font-bold ${emphasized ? "text-primary" : "text-secondary-foreground"}`}>{value}</p>
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
