import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import Chessboard from "@/components/Chessboard";
import FeedbackBanner from "@/components/FeedbackBanner";
import MoveHistory from "@/components/MoveHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { openings, type OpeningNode, type MoveCategory } from "@/data/openings";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
}

export default function Study() {
  const { openingId } = useParams();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();

  const opening = openings.find((o) => o.id === openingId);

  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [currentNodes, setCurrentNodes] = useState<OpeningNode[]>(opening?.tree || []);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [feedback, setFeedback] = useState<{
    type: MoveCategory;
    message: string;
    variationName?: string;
    suggestedMove?: string;
    alternativeNode?: OpeningNode;
  } | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [currentVariation, setCurrentVariation] = useState<{ name: string; description: string } | null>(null);

  // Build move hints from current nodes
  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();

    if (!currentNodes.length) return hints;

    // For each possible node move, try to find the source square
    const tempChess = new Chess(fen);
    const legalMoves = tempChess.moves({ verbose: true });

    currentNodes.forEach((node) => {
      const matching = legalMoves.find((m) => m.san === node.move);
      if (matching) {
        if (!hints.has(matching.from)) {
          hints.set(matching.from, { category: node.category, targets: new Map() });
        }
        hints.get(matching.from)!.targets.set(matching.to, node.category);
        hints.get(matching.from)!.targets.set(matching.san, node.category);
      }
    });

    return hints;
  }, [currentNodes, fen]);

  const handleMove = useCallback(
    (from: string, to: string, san: string) => {
      if (isComputerTurn) return;

      // Find which node matches this move
      const matchedNode = currentNodes.find((node) => node.move === san);

      // Make the move
      try {
        chess.move({ from, to });
      } catch {
        return;
      }

      const newFen = chess.fen();
      setFen(newFen);

      const isWhite = chess.turn() === "b"; // just moved was white
      const moveNum = Math.ceil(chess.moveNumber());
      setMoveHistory((prev) => [...prev, { san, moveNumber: isWhite ? moveNum : moveNum - 1, isWhite }]);
      setMoveCount((c) => c + 1);

      if (!matchedNode) {
        // Unknown move - treat as okay but no feedback from our tree
        setFeedback({
          type: "main_line",
          message: "Interesting move. We don't have this in our study lines yet.",
        });
        setCurrentNodes([]);
        return;
      }

      switch (matchedNode.category) {
        case "main_line":
          setFeedback({
            type: "main_line",
            message: matchedNode.variationName
              ? `Good. This is the ${matchedNode.variationName}.`
              : "Good. Let's continue.",
          });
          if (matchedNode.variationName) {
            setCurrentVariation({
              name: matchedNode.variationName,
              description: `You're studying the ${matchedNode.variationName} — a main line of the Italian Game.`,
            });
          }
          setCurrentNodes(matchedNode.children);

          // Auto-play computer response after a delay
          if (matchedNode.children.length > 0) {
            const mainResponse = matchedNode.children.find((c) => c.category === "main_line");
            if (mainResponse) {
              setIsComputerTurn(true);
              setTimeout(() => {
                try {
                  const result = chess.move(mainResponse.move);
                  if (result) {
                    setFen(chess.fen());
                    const isW = chess.turn() === "b";
                    const mn = Math.ceil(chess.moveNumber());
                    setMoveHistory((prev) => [
                      ...prev,
                      { san: mainResponse.move, moveNumber: isW ? mn : mn - 1, isWhite: isW },
                    ]);
                    setCurrentNodes(mainResponse.children);
                  }
                } catch {
                  // Move failed
                }
                setIsComputerTurn(false);
                setFeedback(null);
              }, 800);
            }
          }
          break;

        case "legit_alternative":
          setFeedback({
            type: "legit_alternative",
            message: `This move is also good — it's called the ${matchedNode.variationName || "Alternative Line"}. Want to switch to studying that line?`,
            variationName: matchedNode.variationName,
            alternativeNode: matchedNode,
          });
          setCurrentNodes(matchedNode.children);
          setCurrentVariation({
            name: matchedNode.variationName || "Alternative Line",
            description: `You're now exploring the ${matchedNode.variationName || "Alternative Line"} — a legitimate deviation from the main Italian Game.`,
          });
          break;

        case "mistake":
          // Undo the move
          chess.undo();
          setFen(chess.fen());
          setMoveHistory((prev) => prev.slice(0, -1));
          setFeedback({
            type: "mistake",
            message: matchedNode.explanation || "That's not the best move here.",
            suggestedMove: matchedNode.suggestedMove,
          });
          break;
      }
    },
    [chess, currentNodes, isComputerTurn]
  );

  const handleReset = () => {
    chess.reset();
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setCurrentNodes(opening?.tree || []);
    setMoveHistory([]);
    setFeedback(null);
    setMoveCount(0);
    setIsComputerTurn(false);
    setCurrentVariation(null);
  };

  if (!opening) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Opening not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${currentTheme.primaryColor}15, transparent 60%), radial-gradient(ellipse at 80% 100%, ${currentTheme.accentColor}08, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">{opening.name}</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {opening.family} Family · Exploration Mode
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, rotate: -20 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="p-2.5 rounded-lg hover:bg-accent transition-colors"
          title="Reset board"
        >
          <RotateCcw className="w-5 h-5 text-foreground/70" />
        </motion.button>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Board section */}
          <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
            <Chessboard
              fen={fen}
              onMove={handleMove}
              moveHints={moveHints}
              disabled={isComputerTurn}
            />

            {/* Feedback area */}
            <div className="mt-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                {feedback && (
                  <FeedbackBanner
                    key={`${feedback.type}-${moveCount}`}
                    type={feedback.type}
                    message={feedback.message}
                    variationName={feedback.variationName}
                    suggestedMove={feedback.suggestedMove}
                    onSwitch={() => {
                      setFeedback({
                        type: "main_line",
                        message: `Switched to the ${feedback.variationName}. Let's explore this line.`,
                      });
                    }}
                    onStay={() => setFeedback(null)}
                    onRetry={() => setFeedback(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-72 space-y-4">
            <MoveHistory moves={moveHistory} />

            {/* Opening info card */}
            <motion.div 
              key={currentVariation?.name || "base"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-4" style={{ background: "hsl(var(--card))" }}
            >
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                {currentVariation ? currentVariation.name : "About This Opening"}
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {currentVariation ? currentVariation.description : opening.description}
              </p>
            </motion.div>

            {/* Current position hint */}
            {currentNodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-4"
                style={{ background: "hsl(var(--card))" }}
              >
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Available Lines
                </h4>
                <div className="space-y-1.5">
                  {currentNodes
                    .filter((n) => n.category !== "mistake")
                    .map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              node.category === "main_line"
                                ? currentTheme.accentColor
                                : "hsl(180, 40%, 55%)",
                          }}
                        />
                        <span className="font-mono text-sm text-foreground/70">{node.move}</span>
                        {node.variationName && (
                          <span className="text-xs italic text-muted-foreground">
                            {node.variationName}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
