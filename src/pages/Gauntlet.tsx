import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Swords, MessageSquare, Flag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Chessboard from "@/components/Chessboard";
import ConfettiBurst from "@/components/ConfettiBurst";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerCharacter } from "@/hooks/usePlayerCharacter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";
import {
  fetchPlayerRating,
  calculateTargetElo,
  createGauntletEngine,
  type GauntletEngine,
} from "@/lib/gauntletEngine";
import { observeMove, buildRawExplanation, generateCoachExplanation } from "@/lib/moveCoach";
import { XP_REWARDS } from "@/data/rpgData";

interface MoveEntry {
  san: string;
  fen: string;
  fenBefore: string;
  color: "w" | "b";
  explanation?: string;
  loadingExplanation?: boolean;
}

type GamePhase = "loading" | "ready" | "playing" | "finished";

export default function Gauntlet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXpAndEmbers } = usePlayerCharacter();

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [playerRating, setPlayerRating] = useState<number | null>(null);
  const [targetElo, setTargetElo] = useState(1500);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [moves, setMoves] = useState<MoveEntry[]>([]);
  const [result, setResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedMoveIdx, setSelectedMoveIdx] = useState<number | null>(null);
  const [resigned, setResigned] = useState(false);

  const engineRef = useRef<GauntletEngine | null>(null);
  const movesEndRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  const { data: profile } = useQuery({
    queryKey: ["gauntlet-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("chesscom_username, lichess_username")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch rating on mount
  useEffect(() => {
    if (!profile) return;
    fetchPlayerRating(profile.chesscom_username, profile.lichess_username).then((r) => {
      const rating = r ?? 1200; // default if not found
      setPlayerRating(rating);
      setTargetElo(calculateTargetElo(rating));
      setPhase("ready");
    });
  }, [profile]);

  const startGame = useCallback(
    async (color: "w" | "b") => {
      setPlayerColor(color);
      setPhase("playing");
      setMoves([]);
      setResult(null);
      setResigned(false);
      setSelectedMoveIdx(null);
      setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      const engine = await createGauntletEngine(targetElo, color);
      engineRef.current = engine;

      // If player is black, engine moves first
      if (color === "b") {
        const engineMove = await engine.makeEngineMove();
        if (engineMove) {
          const newFen = engine.getFen();
          const entry: MoveEntry = {
            san: engineMove.san,
            fen: newFen,
            fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            color: "w",
            loadingExplanation: true,
          };
          setMoves([entry]);
          setFen(newFen);
          // Generate explanation async
          generateExplanation(entry, 0, [entry]);
        }
      }
    },
    [targetElo]
  );

  const generateExplanation = useCallback(
    async (entry: MoveEntry, idx: number, currentMoves: MoveEntry[]) => {
      const moveNum = Math.floor(idx / 2) + 1;
      const isPlayerMove = entry.color === engineRef.current?.playerColor;
      try {
        const explanation = await generateCoachExplanation(
          entry.fenBefore,
          entry.san,
          isPlayerMove,
          moveNum,
          engineRef.current?.playerColor || "w"
        );
        setMoves((prev) =>
          prev.map((m, i) => (i === idx ? { ...m, explanation, loadingExplanation: false } : m))
        );
      } catch {
        const raw = buildRawExplanation(observeMove(entry.fenBefore, entry.san));
        setMoves((prev) =>
          prev.map((m, i) => (i === idx ? { ...m, explanation: raw, loadingExplanation: false } : m))
        );
      }
    },
    []
  );

  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (phase !== "playing" || result) return hints;
    try {
      const game = new Chess(fen);
      if (game.turn() !== playerColor) return hints;
      const legalMoves = game.moves({ verbose: true });
      for (const m of legalMoves) {
        if (!hints.has(m.from)) {
          hints.set(m.from, { category: "main" as MoveCategory, targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main" as MoveCategory);
      }
    } catch {}
    return hints;
  }, [fen, phase, result, playerColor]);

  const handleMove = useCallback(
    async (from: string, to: string, san: string) => {
      const engine = engineRef.current;
      if (!engine || engine.isGameOver() || processingRef.current) return;
      processingRef.current = true;

      const fenBefore = engine.getFen();

      // Make player move
      const playerResult = engine.makePlayerMove(from, to);
      if (!playerResult) {
        processingRef.current = false;
        return;
      }

      const afterPlayerFen = engine.getFen();
      const playerEntry: MoveEntry = {
        san: playerResult.san,
        fen: afterPlayerFen,
        fenBefore,
        color: playerColor,
        loadingExplanation: true,
      };

      // Add player move and wait for explanation before engine responds
      const playerIdx = await new Promise<number>((resolve) => {
        setMoves((prev) => {
          const next = [...prev, playerEntry];
          resolve(next.length - 1);
          return next;
        });
      });
      setFen(afterPlayerFen);

      // Wait for player explanation to load before engine moves
      const moveNum = Math.floor(playerIdx / 2) + 1;
      try {
        const explanation = await generateCoachExplanation(
          fenBefore,
          playerResult.san,
          true,
          moveNum,
          playerColor
        );
        setMoves((prev) =>
          prev.map((m, i) => (i === playerIdx ? { ...m, explanation, loadingExplanation: false } : m))
        );
      } catch {
        const raw = buildRawExplanation(observeMove(fenBefore, playerResult.san));
        setMoves((prev) =>
          prev.map((m, i) => (i === playerIdx ? { ...m, explanation: raw, loadingExplanation: false } : m))
        );
      }

      // Check if game over after player move
      if (engine.isGameOver()) {
        const r = engine.getResult();
        setResult(r);
        if (r === "win") setShowConfetti(true);
        setPhase("finished");
        processingRef.current = false;
        return;
      }

      // Small delay so player can read their explanation
      await new Promise((r) => setTimeout(r, 1200));

      // Engine responds
      const engineMove = await engine.makeEngineMove();
      if (engineMove) {
        const afterEngineFen = engine.getFen();
        const engineEntry: MoveEntry = {
          san: engineMove.san,
          fen: afterEngineFen,
          fenBefore: afterPlayerFen,
          color: playerColor === "w" ? "b" : "w",
          loadingExplanation: true,
        };

        setMoves((prev) => {
          const next = [...prev, engineEntry];
          generateExplanation(engineEntry, next.length - 1, next);
          return next;
        });
        setFen(afterEngineFen);

        if (engine.isGameOver()) {
          const r = engine.getResult();
          setResult(r);
          if (r === "win") setShowConfetti(true);
          setPhase("finished");
        }
      }

      processingRef.current = false;
    },
    [playerColor, generateExplanation]
  );

  const handleResign = useCallback(() => {
    setResigned(true);
    setResult("loss");
    setPhase("finished");
    engineRef.current?.destroy();
  }, []);

  // Scroll move list to bottom
  useEffect(() => {
    movesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // XP on finish
  useEffect(() => {
    if (phase !== "finished" || !result) return;
    const xp = result === "win" ? 120 : result === "draw" ? 60 : 20;
    addXpAndEmbers.mutate({ xp, embers: 0 });
  }, [phase, result]);

  const displayExplanation = selectedMoveIdx !== null ? moves[selectedMoveIdx] : moves[moves.length - 1];

  // Loading
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Swords className="w-12 h-12 text-red-500" />
        </motion.div>
        <p className="ml-3 text-muted-foreground">Fetching your rating...</p>
      </div>
    );
  }

  // Ready — pick color
  if (phase === "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 max-w-md">
          <Swords className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">The Gauntlet</h1>
          <p className="text-muted-foreground mb-1">
            Your rating: <span className="text-foreground font-bold">{playerRating ?? "~1200"}</span>
          </p>
          <p className="text-muted-foreground mb-6">
            Engine ELO: <span className="text-red-400 font-bold">{targetElo}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-4">Choose your side:</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => startGame("w")}
              className="px-8 py-6 text-lg bg-white text-black hover:bg-gray-200 border border-border"
            >
              ♔ White
            </Button>
            <Button
              onClick={() => startGame("b")}
              className="px-8 py-6 text-lg bg-gray-900 text-white hover:bg-gray-800 border border-border"
            >
              ♚ Black
            </Button>
          </div>
          <Button variant="ghost" className="mt-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Forge
          </Button>
        </motion.div>
      </div>
    );
  }

  // Finished
  if (phase === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ConfettiBurst trigger={showConfetti} />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">
            {result === "win" ? "⚔️" : result === "draw" ? "🤝" : "💀"}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {result === "win" ? "Victory!" : result === "draw" ? "Draw" : resigned ? "You Resigned" : "Defeated"}
          </h2>
          <p className="text-muted-foreground mb-2">
            vs Engine ({targetElo} ELO) · {moves.length} moves
          </p>
          <p className="text-sm text-orange-400 mb-6">
            +{result === "win" ? 120 : result === "draw" ? 60 : 20} XP
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Forge
            </Button>
            <Button onClick={() => { engineRef.current?.destroy(); setPhase("ready"); }}>
              <RotateCcw className="w-4 h-4 mr-2" /> Rematch
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-500" /> The Gauntlet
            </h1>
            <p className="text-xs text-muted-foreground">
              vs Engine ({targetElo} ELO) · {playerColor === "w" ? "Playing White" : "Playing Black"}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleResign}>
            <Flag className="w-3 h-3 mr-1" /> Resign
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Board */}
          <div className="flex justify-center">
            <div className="w-full max-w-[500px] aspect-square">
              <Chessboard
                fen={fen}
                onMove={handleMove}
                moveHints={moveHints}
                disabled={phase !== "playing" || !!result}
                flipped={playerColor === "b"}
                playerColor={playerColor}
              />
            </div>
          </div>

          {/* Side panel — Moves + Coach */}
          <div className="flex flex-col gap-3">
            {/* Move list */}
            <div className="rounded-xl border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Moves</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-0.5 text-sm font-mono">
                  {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
                    const whiteMove = moves[i * 2];
                    const blackMove = moves[i * 2 + 1];
                    return (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                        <span
                          onClick={() => setSelectedMoveIdx(i * 2)}
                          className={`cursor-pointer px-1 rounded hover:bg-primary/10 ${
                            selectedMoveIdx === i * 2 ? "bg-primary/20 text-primary" : "text-foreground"
                          }`}
                        >
                          {whiteMove?.san}
                        </span>
                        {blackMove && (
                          <span
                            onClick={() => setSelectedMoveIdx(i * 2 + 1)}
                            className={`cursor-pointer px-1 rounded hover:bg-primary/10 ${
                              selectedMoveIdx === i * 2 + 1 ? "bg-primary/20 text-primary" : "text-foreground"
                            }`}
                          >
                            {blackMove.san}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div ref={movesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Coach commentary */}
            <div className="rounded-xl border border-border bg-card p-3 flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Coach
              </h3>
              <AnimatePresence mode="wait">
                {displayExplanation ? (
                  <motion.div
                    key={selectedMoveIdx ?? moves.length}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-foreground/90 leading-relaxed"
                  >
                    <span className="font-bold text-primary">
                      {displayExplanation.color === playerColor ? "You" : "Coach"} played {displayExplanation.san}
                    </span>
                    {" — "}
                    {displayExplanation.loadingExplanation ? (
                      <span className="text-muted-foreground italic">Thinking...</span>
                    ) : (
                      displayExplanation.explanation || "..."
                    )}
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Make a move to hear from the coach.</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
