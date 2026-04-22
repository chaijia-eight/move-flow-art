import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import { ArrowLeft, RotateCcw, Save, Send, Trash2, Wand2 } from "lucide-react";
import Chessboard from "@/components/Chessboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const WEAKNESS_TAGS = [
  "fork",
  "pin",
  "skewer",
  "back_rank",
  "discovered_attack",
  "double_attack",
  "mate_in_1",
  "mate_in_2",
  "hanging_piece",
  "trapped_piece",
  "rook_endgame",
  "endgame_tech",
];

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Position state
  const [startFen, setStartFen] = useState(STARTING_FEN);
  const [fenInput, setFenInput] = useState(STARTING_FEN);
  const [fenError, setFenError] = useState<string | null>(null);

  // Solution state — chess.js ref tracks current position; solutionSan grows on every legal move.
  const chessRef = useRef(new Chess(startFen));
  const [currentFen, setCurrentFen] = useState(startFen);
  const [solutionSan, setSolutionSan] = useState<string[]>([]);

  // Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hint, setHint] = useState("");
  const [tag, setTag] = useState<string>("fork");
  const [difficulty, setDifficulty] = useState(3);
  const [timeLimit, setTimeLimit] = useState(20);

  const [saving, setSaving] = useState<"idle" | "draft" | "publish">("idle");

  // Reset chess.js when starting position changes.
  useEffect(() => {
    try {
      const c = new Chess(startFen);
      chessRef.current = c;
      setCurrentFen(c.fen());
      setSolutionSan([]);
    } catch {
      // ignore — UI will surface FEN error from validation
    }
  }, [startFen]);

  const handleFenLoad = () => {
    try {
      // chess.js throws on invalid FEN.
      // eslint-disable-next-line no-new
      new Chess(fenInput.trim());
      setFenError(null);
      setStartFen(fenInput.trim());
    } catch (e: any) {
      setFenError(e?.message ?? "Invalid FEN");
    }
  };

  const handleMove = (from: string, to: string, _san: string) => {
    // Re-derive SAN from chess.js to keep notation consistent (handles promotion, castles).
    try {
      const move = chessRef.current.move({ from, to, promotion: "q" });
      if (!move) return;
      setCurrentFen(chessRef.current.fen());
      setSolutionSan((prev) => [...prev, move.san]);
    } catch {
      // illegal — ignore
    }
  };

  const handleUndo = () => {
    chessRef.current.undo();
    setCurrentFen(chessRef.current.fen());
    setSolutionSan((prev) => prev.slice(0, -1));
  };

  const handleResetSolution = () => {
    chessRef.current = new Chess(startFen);
    setCurrentFen(chessRef.current.fen());
    setSolutionSan([]);
  };

  const playerColor = useMemo<"w" | "b">(
    () => (startFen.split(" ")[1] === "b" ? "b" : "w"),
    [startFen],
  );

  const canSave = title.trim().length > 0 && solutionSan.length > 0 && !!user;

  const save = async (status: "draft" | "published") => {
    if (!user || !canSave) return;
    setSaving(status === "draft" ? "draft" : "publish");

    try {
      const { data: contentRow, error: contentErr } = await supabase
        .from("content")
        .insert({
          creator_id: user.id,
          type: "blitz",
          status,
          title: title.trim(),
          description: description.trim() || null,
          thumbnail_fen: startFen,
          tags: [tag],
          difficulty,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (contentErr) throw contentErr;

      const { error: blitzErr } = await supabase.from("blitz_content").insert({
        content_id: contentRow.id,
        fen: startFen,
        solution_san: solutionSan,
        hint: hint.trim() || null,
        time_limit_seconds: timeLimit,
      });
      if (blitzErr) throw blitzErr;

      toast({
        title: status === "published" ? "Puzzle published!" : "Draft saved",
        description:
          status === "published"
            ? "It's now in the For You feed."
            : "Find it later under your profile.",
      });
      navigate("/");
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Couldn't save puzzle",
        description: e.message ?? "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving("idle");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto p-5 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-lg font-bold text-foreground">New Blitz</h1>
          <div className="w-12" />
        </div>

        {/* Step 1: position */}
        <Section
          step={1}
          title="Set the position"
          subtitle="Paste a FEN, or set up from the starting position."
        >
          <div className="flex gap-2">
            <input
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              placeholder="Paste FEN…"
              className="flex-1 h-10 px-3 rounded-lg bg-secondary text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleFenLoad}
              className="h-10 px-3 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 inline-flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" />
              Load
            </button>
          </div>
          {fenError && <p className="text-xs text-destructive">{fenError}</p>}
        </Section>

        {/* Step 2: board + solution */}
        <Section
          step={2}
          title="Play the solution"
          subtitle={`${playerColor === "w" ? "White" : "Black"} to move. Each move you make is recorded as the next step of the solution.`}
        >
          <div className="grid md:grid-cols-[1fr_220px] gap-5">
            <div className="aspect-square w-full max-w-[420px] mx-auto">
              <Chessboard
                fen={currentFen}
                onMove={handleMove}
                moveHints={new Map()}
                flipped={playerColor === "b"}
                playerColor={chessRef.current.turn()}
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-3 min-h-[120px]">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Solution
                </div>
                {solutionSan.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No moves yet. Make the player's move first, then the
                    opponent's reply, etc.
                  </p>
                ) : (
                  <ol className="text-sm font-mono text-foreground space-y-0.5">
                    {solutionSan.map((san, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted-foreground w-6">
                          {i + 1}.
                        </span>
                        <span
                          className={
                            i % 2 === 0 ? "text-primary" : "text-foreground"
                          }
                        >
                          {san}
                        </span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {i % 2 === 0 ? "you" : "opp"}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={solutionSan.length === 0}
                  className="flex-1 h-9 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  onClick={handleResetSolution}
                  disabled={solutionSan.length === 0}
                  className="flex-1 h-9 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Step 3: metadata */}
        <Section
          step={3}
          title="Describe it"
          subtitle="Title and weakness tag are required for personalization."
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Back-rank trap"
                maxLength={80}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>
            <Field label="Weakness tag">
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {WEAKNESS_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hint (optional)">
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="One nudge towards the idea."
                maxLength={140}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>
            <Field label="Description (optional)">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short context shown after solve."
                maxLength={200}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>
            <Field label={`Difficulty: ${difficulty}/10`}>
              <input
                type="range"
                min={1}
                max={10}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </Field>
            <Field label={`Time limit: ${timeLimit}s`}>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </Field>
          </div>
        </Section>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-5 px-5 py-4 bg-background/95 backdrop-blur border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {!user
              ? "Sign in to save."
              : !title.trim()
                ? "Add a title to continue."
                : solutionSan.length === 0
                  ? "Play at least one move on the board."
                  : `${solutionSan.length} move${solutionSan.length === 1 ? "" : "s"} captured.`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => save("draft")}
              disabled={!canSave || saving !== "idle"}
              className="h-10 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>
            <button
              onClick={() => save("published")}
              disabled={!canSave || saving !== "idle"}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {saving === "publish" ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-3">
      <header>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            {step}
          </span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 ml-7">{subtitle}</p>
      </header>
      <div className="ml-7 space-y-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
