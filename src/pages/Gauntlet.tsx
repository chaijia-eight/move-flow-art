import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Flag, RotateCcw } from "lucide-react";
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

interface MoveEntry {
  san: string;
  fen: string;
  fenBefore: string;
  color: "w" | "b";
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

  // Pre-warm Stockfish WASM by creating a worker early
  const warmEngineRef = useRef<GauntletEngine | null>(null);
  const warmingRef = useRef(false);

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

  // Pre-warm engine while user picks a side
  useEffect(() => {
    if (phase !== "ready" || warmingRef.current) return;
    warmingRef.current = true;
    // Pre-create engine with white as default; will be recreated if needed
    createGauntletEngine(targetElo, "w").then((eng) => {
      warmEngineRef.current = eng;
    }).catch(() => { warmingRef.current = false; });
  }, [phase, targetElo]);

  const startGame = useCallback(
    async (color: "w" | "b") => {
      setPlayerColor(color);
      setPhase("playing");
      setMoves([]);
      setResult(null);
      setResigned(false);
      setSelectedMoveIdx(null);
      setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      let engine: GauntletEngine;
      
      // Reuse pre-warmed engine if color matches, otherwise create new
      if (warmEngineRef.current && color === "w") {
        engine = warmEngineRef.current;
        warmEngineRef.current = null;
      } else {
        warmEngineRef.current?.destroy();
        warmEngineRef.current = null;
        engine = await createGauntletEngine(targetElo, color);
      }
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
          };
          setMoves([entry]);
          setFen(newFen);
        }
      }
    },
    [targetElo]
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
          hints.set(m.from, { category: "main_line" as MoveCategory, targets: new Map() });
        }
        hints.get(m.from)!.targets.set(m.to, "main_line" as MoveCategory);
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
      };
      setMoves((prev) => [...prev, playerEntry]);
      setFen(afterPlayerFen);

      // Check if game over after player move
      if (engine.isGameOver()) {
        const r = engine.getResult();
        setResult(r);
        if (r === "win") setShowConfetti(true);
        setPhase("finished");
        processingRef.current = false;
        return;
      }

      // Engine responds
      const engineMove = await engine.makeEngineMove();
      if (engineMove) {
        const afterEngineFen = engine.getFen();
        const engineEntry: MoveEntry = {
          san: engineMove.san,
          fen: afterEngineFen,
          fenBefore: afterPlayerFen,
          color: playerColor === "w" ? "b" : "w",
        };
        setMoves((prev) => [...prev, engineEntry]);
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
    [playerColor]
  );

  const handleResign = useCallback(() => {
    setResigned(true);
    setResult("loss");
    setPhase("finished");
    engineRef.current?.destroy();
  }, []);

  // Scroll move list to bottom when a new move is added (not when navigating)
  useEffect(() => {
    if (selectedMoveIdx === null) {
      movesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [moves.length, selectedMoveIdx]);

  // Arrow-key navigation through move history
  useEffect(() => {
    if (phase !== "playing" && phase !== "finished") return;
    const onKey = (e: KeyboardEvent) => {
      if (moves.length === 0) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedMoveIdx((cur) => {
          const idx = cur ?? moves.length - 1;
          return Math.max(0, idx - 1);
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedMoveIdx((cur) => {
          if (cur === null) return moves.length - 1;
          if (cur >= moves.length - 1) return null; // back to live
          return cur + 1;
        });
      } else if (e.key === "ArrowDown" || e.key === "End") {
        e.preventDefault();
        setSelectedMoveIdx(null);
      } else if (e.key === "ArrowUp" || e.key === "Home") {
        e.preventDefault();
        setSelectedMoveIdx(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, moves.length]);

  // Board shows historical position when navigating
  const displayedFen = selectedMoveIdx !== null ? (moves[selectedMoveIdx]?.fen ?? fen) : fen;
  const isViewingHistory = selectedMoveIdx !== null && selectedMoveIdx < moves.length - 1;

  // Cleanup
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      warmEngineRef.current?.destroy();
    };
  }, []);

  // XP on finish
  useEffect(() => {
    if (phase !== "finished" || !result) return;
    const xp = result === "win" ? 120 : result === "draw" ? 60 : 20;
    addXpAndEmbers.mutate({ xp, embers: 0 });
  }, [phase, result]);

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
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[500px] aspect-square">
              <Chessboard
                fen={displayedFen}
                onMove={handleMove}
                moveHints={isViewingHistory ? new Map() : moveHints}
                disabled={phase !== "playing" || !!result || isViewingHistory}
                flipped={playerColor === "b"}
                playerColor={playerColor}
              />
            </div>
            {isViewingHistory && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Viewing move {selectedMoveIdx! + 1} · press → or ↓ to return to live
              </p>
            )}
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
        </div>
      </div>
    </div>
  );
}
