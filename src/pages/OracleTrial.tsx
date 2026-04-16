import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, AlertTriangle, Lightbulb, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Chessboard from "@/components/Chessboard";
import ConfettiBurst from "@/components/ConfettiBurst";
import { getOraclePositionById } from "@/data/oracleData";
import { getEngine, destroyEngine } from "@/lib/stockfishEngine";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";

type TrialStatus = "playing" | "won" | "lost" | "drew";

export default function OracleTrial() {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const position = getOraclePositionById(positionId ?? "");

  const [game, setGame] = useState<Chess | null>(null);
  const [fen, setFen] = useState("");
  const [moveCount, setMoveCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<TrialStatus>("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const engineReady = useRef(false);

  // Init game
  useEffect(() => {
    if (!position) return;
    const chess = new Chess(position.fen);
    setGame(chess);
    setFen(chess.fen());
    setMoveCount(0);
    setMistakes(0);
    setStatus("playing");

    // Init engine
    const initEngine = async () => {
      try {
        const engine = getEngine();
        await engine.init();
        engineReady.current = true;

        // If it's engine's turn first, make engine move
        const turn = chess.turn();
        if (turn !== position.playerColor) {
          makeEngineMove(chess);
        }
      } catch (e) {
        console.error("Engine init failed:", e);
      }
    };
    initEngine();

    return () => { engineReady.current = false; };
  }, [position]);

  const makeEngineMove = useCallback(async (chess: Chess) => {
    if (!engineReady.current || chess.isGameOver()) return;
    setThinking(true);
    try {
      const engine = getEngine();
      const result = await engine.evaluate(chess.fen(), 12);
      if (result.bestMove && !chess.isGameOver()) {
        const from = result.bestMove.slice(0, 2);
        const to = result.bestMove.slice(2, 4);
        const promo = result.bestMove.length > 4 ? result.bestMove[4] : undefined;
        chess.move({ from, to, promotion: promo });
        setFen(chess.fen());
        setMoveCount((c) => c + 1);
        checkGameEnd(chess);
      }
    } catch (e) {
      console.error("Engine move failed:", e);
    }
    setThinking(false);
  }, []);

  const checkGameEnd = useCallback((chess: Chess) => {
    if (!position) return;
    if (chess.isCheckmate()) {
      const loser = chess.turn();
      if (position.mode === "converter") {
        setStatus(loser !== position.playerColor ? "won" : "lost");
        if (loser !== position.playerColor) setShowConfetti(true);
      } else {
        setStatus(loser === position.playerColor ? "lost" : "won");
      }
    } else if (chess.isStalemate() || chess.isDraw()) {
      if (position.mode === "defender") {
        setStatus("won");
        setShowConfetti(true);
      } else {
        setStatus("drew");
      }
    } else if (position.mode === "defender" && position.targetMoves && moveCount >= position.targetMoves) {
      setStatus("won");
      setShowConfetti(true);
    }
  }, [position, moveCount]);

  const moveHints = useMemo(() => {
    if (!game || status !== "playing") return new Map();
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    for (const move of game.moves({ verbose: true })) {
      const existing = hints.get(move.from);
      const targets = existing?.targets ?? new Map<string, MoveCategory>();
      targets.set(move.to, "main_line");
      hints.set(move.from, { category: "main_line", targets });
    }
    return hints;
  }, [game, fen, status]);

  const handleMove = useCallback(
    async (_from: string, _to: string, san: string) => {
      if (!game || !position || status !== "playing" || thinking) return;

      // Check if user's move is optimal
      if (engineReady.current) {
        try {
          const engine = getEngine();
          const result = await engine.evaluate(game.fen(), 12);
          const bestSan = result.bestMove;
          const userUci = _from + _to;
          if (bestSan && userUci !== bestSan.slice(0, 4)) {
            setMistakes((m) => m + 1);
          }
        } catch {}
      }

      setMoveCount((c) => c + 1);
      setFen(game.fen());
      setShowHint(false);
      setHintMove(null);
      checkGameEnd(game);

      // Engine responds
      if (!game.isGameOver()) {
        await makeEngineMove(game);
      }
    },
    [game, position, status, thinking, makeEngineMove, checkGameEnd]
  );

  const handleHint = useCallback(async () => {
    if (!game || !engineReady.current) return;
    try {
      const engine = getEngine();
      const result = await engine.evaluate(game.fen(), 12);
      if (result.bestMove) {
        setHintMove({ from: result.bestMove.slice(0, 2), to: result.bestMove.slice(2, 4) });
        setShowHint(true);
      }
    } catch {}
  }, [game]);

  if (!position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Position not found.</p>
          <Button variant="outline" onClick={() => navigate("/oracle")}>Back to Oracle</Button>
        </div>
      </div>
    );
  }

  if (status !== "playing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md px-4">
          {status === "won" ? (
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          ) : (
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          )}
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            {status === "won" ? "Trial Complete!" : status === "lost" ? "Trial Failed" : "Draw"}
          </h1>
          <p className="text-muted-foreground mb-2">
            {moveCount} moves · {mistakes} non-optimal moves
          </p>
          {mistakes === 0 && status === "won" && (
            <p className="text-yellow-400 font-semibold mb-4">Perfect! ✨</p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => {
              const chess = new Chess(position.fen);
              setGame(chess);
              setFen(chess.fen());
              setMoveCount(0);
              setMistakes(0);
              setStatus("playing");
              setShowHint(false);
              setHintMove(null);
              if (chess.turn() !== position.playerColor && engineReady.current) {
                makeEngineMove(chess);
              }
            }}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate("/oracle")}>
              Back to Oracle
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/oracle")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{position.name}</h2>
              <p className="text-xs text-muted-foreground">
                {position.mode === "converter" ? "Deliver checkmate" : `Survive ${position.targetMoves} moves`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Moves: {moveCount}</span>
            <span className={mistakes > 0 ? "text-red-400" : ""}>Mistakes: {mistakes}</span>
          </div>
        </div>

        {thinking && (
          <div className="mb-2 text-center text-xs text-muted-foreground animate-pulse">Stockfish is thinking...</div>
        )}

        <div className="flex gap-6 justify-center">
          <div className="w-full max-w-[480px]">
            <Chessboard
              fen={fen}
              onMove={handleMove}
              moveHints={moveHints}
              disabled={thinking || status !== "playing"}
              flipped={position.playerColor === "b"}
              playerColor={position.playerColor}
              arrowFrom={showHint ? hintMove?.from : undefined}
              arrowTo={showHint ? hintMove?.to : undefined}
            />

            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleHint} className="gap-1.5 text-muted-foreground">
                <Lightbulb className="w-4 h-4" /> Hint
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
