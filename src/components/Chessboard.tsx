import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import { fenToBoard, PIECE_IMAGES, coordsToSquare, squareToCoords } from "@/data/pieceUnicode";
import { useTheme } from "@/contexts/ThemeContext";
import CaptureEffect from "@/components/CaptureEffect";
import { playMoveSound, playCaptureSound } from "@/lib/chessSounds";
import type { MoveCategory } from "@/data/openings";

interface ChessboardProps {
  fen: string;
  onMove: (from: string, to: string, san: string) => void;
  moveHints: Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>;
  disabled?: boolean;
  flipped?: boolean;
  playerColor?: "w" | "b";
}

interface AnimMove {
  from: string;
  to: string;
  isCapture: boolean;
  id: number;
}

let animIdCounter = 0;

export default function Chessboard({ fen, onMove, moveHints, disabled, flipped = false, playerColor }: ChessboardProps) {
  const { currentTheme } = useTheme();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [animMove, setAnimMove] = useState<AnimMove | null>(null);
  const prevBoardRef = useRef<(string | null)[][] | null>(null);
  const prevFenRef = useRef<string>(fen);

  const board = useMemo(() => fenToBoard(fen), [fen]);
  const chess = useMemo(() => new Chess(fen), [fen]);

  // Detect moves by comparing previous and current board
  useEffect(() => {
    const prevBoard = prevBoardRef.current;
    if (prevBoard && prevFenRef.current !== fen) {
      // Find the from/to by diffing boards
      let fromSquare: string | null = null;
      let toSquare: string | null = null;
      let wasCapture = false;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const prev = prevBoard[r][c];
          const curr = board[r][c];
          if (prev !== curr) {
            const sq = coordsToSquare(r, c);
            if (prev && !curr) {
              // Piece left this square
              fromSquare = sq;
            } else if (curr && !prev) {
              // Piece arrived at empty square
              toSquare = sq;
            } else if (prev && curr && prev !== curr) {
              // Piece replaced another (capture)
              // Could be "to" if a piece landed here, or castling
              if (!toSquare) {
                toSquare = sq;
                wasCapture = true;
              } else {
                fromSquare = sq;
              }
            }
          }
        }
      }

      if (fromSquare && toSquare) {
        setAnimMove({ from: fromSquare, to: toSquare, isCapture: wasCapture, id: ++animIdCounter });
        setLastMove({ from: fromSquare, to: toSquare });
        // Play sound
        if (wasCapture) {
          playCaptureSound();
        } else {
          playMoveSound();
        }
      }
    }

    prevBoardRef.current = board.map(row => [...row]);
    prevFenRef.current = fen;
  }, [fen, board]);

  // Clear capture effect after animation
  useEffect(() => {
    if (animMove) {
      const t = setTimeout(() => setAnimMove(null), 500);
      return () => clearTimeout(t);
    }
  }, [animMove]);

  const getLegalMoves = useCallback((square: string) => {
    try {
      return chess.moves({ square: square as any, verbose: true });
    } catch {
      return [];
    }
  }, [chess]);

  const getSquareColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? "light" : "dark";
  };

  const displayToBoard = (displayRow: number, displayCol: number): [number, number] => {
    if (flipped) return [7 - displayRow, 7 - displayCol];
    return [displayRow, displayCol];
  };

  const boardToDisplay = (boardRow: number, boardCol: number): [number, number] => {
    if (flipped) return [7 - boardRow, 7 - boardCol];
    return [boardRow, boardCol];
  };

  const handleSquareClick = (displayRow: number, displayCol: number) => {
    if (disabled) return;
    // Block interaction if it's not the player's turn
    if (playerColor && chess.turn() !== playerColor) return;
    const [row, col] = displayToBoard(displayRow, displayCol);
    const square = coordsToSquare(row, col);
    const piece = board[row][col];

    if (selectedSquare) {
      const legalMoves = getLegalMoves(selectedSquare);
      const targetMove = legalMoves.find(m => m.to === square);
      
      if (targetMove) {
        onMove(selectedSquare, square, targetMove.san);
        setSelectedSquare(null);
        return;
      }
    }

    if (piece && ((chess.turn() === "w" && piece === piece.toUpperCase()) || 
                   (chess.turn() === "b" && piece === piece.toLowerCase()))) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const legalTargets = useMemo(() => {
    if (!selectedSquare) return new Map<string, MoveCategory>();
    const moves = getLegalMoves(selectedSquare);
    const targets = new Map<string, MoveCategory>();
    
    moves.forEach(m => {
      let category: MoveCategory = "mistake";
      const hintForSquare = moveHints.get(selectedSquare);
      if (hintForSquare) {
        const bySan = hintForSquare.targets.get(m.san);
        const byTo = hintForSquare.targets.get(m.to);
        if (bySan) category = bySan;
        else if (byTo) category = byTo;
      }
      targets.set(m.to, category);
    });
    
    return targets;
  }, [selectedSquare, moveHints, getLegalMoves]);

  const getMoveIndicatorColor = (category: MoveCategory) => {
    switch (category) {
      case "main_line": return currentTheme.accentColor;
      case "legit_alternative": return "hsl(180, 40%, 55%)";
      case "mistake": return "hsl(0, 72%, 50%)";
    }
  };

  // Calculate slide offset in percentage (each square = 12.5%)
  const getSlideOffset = (from: string, to: string): { x: string; y: string } => {
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    const [fromDispRow, fromDispCol] = boardToDisplay(fromRow, fromCol);
    const [toDispRow, toDispCol] = boardToDisplay(toRow, toCol);
    const dx = (fromDispCol - toDispCol) * 100;
    const dy = (fromDispRow - toDispRow) * 100;
    return { x: `${dx}%`, y: `${dy}%` };
  };

  return (
    <div className="relative">
      <div 
        className="p-3 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})`,
          boxShadow: `0 20px 60px -15px ${currentTheme.primaryColor}80, 0 10px 30px -10px rgba(0,0,0,0.5)`,
        }}
      >
        <div className="p-1 rounded-lg" style={{ background: `${currentTheme.accentColor}30` }}>
          <div className="grid grid-cols-8 rounded-md overflow-hidden" style={{ aspectRatio: "1" }}>
            {Array.from({ length: 8 }, (_, displayRow) =>
              Array.from({ length: 8 }, (_, displayCol) => {
                const [boardRow, boardCol] = displayToBoard(displayRow, displayCol);
                const square = coordsToSquare(boardRow, boardCol);
                const piece = board[boardRow][boardCol];
                const isLight = getSquareColor(boardRow, boardCol) === "light";
                const isSelected = selectedSquare === square;
                const isLastMove = lastMove?.from === square || lastMove?.to === square;
                const targetCategory = legalTargets.get(square);
                const isTarget = targetCategory !== undefined;
                const isAnimTo = animMove?.to === square;
                const isCaptureSquare = animMove?.isCapture && animMove?.to === square;

                const slideOffset = isAnimTo && animMove
                  ? getSlideOffset(animMove.from, animMove.to)
                  : null;

                return (
                  <div
                    key={square}
                    className="relative flex items-center justify-center cursor-pointer transition-colors duration-150"
                    style={{
                      background: isSelected
                        ? `${currentTheme.accentColor}60`
                        : isLastMove
                        ? `${currentTheme.accentColor}25`
                        : isLight
                        ? currentTheme.boardLight
                        : currentTheme.boardDark,
                      aspectRatio: "1",
                    }}
                    onClick={() => handleSquareClick(displayRow, displayCol)}
                  >
                    {isLight && (
                      <div 
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(ellipse at ${30 + boardCol * 10}% ${20 + boardRow * 10}%, rgba(0,0,0,0.08), transparent 60%)`,
                        }}
                      />
                    )}

                    {/* Capture burst effect */}
                    <CaptureEffect active={!!isCaptureSquare} />

                    {/* Move target indicators */}
                    <AnimatePresence>
                      {isTarget && !piece && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute z-10"
                        >
                          {targetCategory === "main_line" && (
                            <div className="w-5 h-5 rounded-full"
                              style={{ 
                                background: `radial-gradient(circle, hsl(42, 90%, 65%), hsl(42, 85%, 50%))`,
                                boxShadow: `0 0 14px hsl(42, 90%, 60%), 0 0 6px hsl(42, 90%, 70%)`,
                                border: "1.5px solid hsl(42, 90%, 75%)",
                              }}
                            />
                          )}
                          {targetCategory === "legit_alternative" && (
                            <div className="w-5 h-5"
                              style={{
                                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                background: "hsl(180, 50%, 60%)",
                                boxShadow: "0 0 10px hsl(180, 50%, 60%)",
                                opacity: 0.7,
                              }}
                            />
                          )}
                          {targetCategory === "mistake" && (
                            <div className="w-5 h-5 rounded-full"
                              style={{
                                background: "radial-gradient(circle, hsl(0, 72%, 55%), hsl(0, 60%, 40%))",
                                boxShadow: "0 0 12px hsl(0, 72%, 50%), 0 0 5px hsl(0, 72%, 60%)",
                                border: "1.5px solid hsl(0, 72%, 65%)",
                              }}
                            />
                          )}
                        </motion.div>
                      )}
                      {isTarget && piece && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute inset-0 z-10 pointer-events-none"
                          style={{
                            border: `3px solid ${getMoveIndicatorColor(targetCategory!)}`,
                            borderRadius: targetCategory === "legit_alternative" ? "0" : "50%",
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Chess piece with slide animation */}
                    {piece && (
                      <motion.img
                        key={`${square}-${animMove?.id ?? 0}`}
                        src={PIECE_IMAGES[piece]}
                        alt={piece}
                        draggable={false}
                        className="relative z-20 select-none w-[80%] h-[80%] object-contain"
                        style={{ cursor: disabled ? "default" : "pointer" }}
                        initial={slideOffset ? { x: slideOffset.x, y: slideOffset.y } : false}
                        animate={{ x: 0, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        whileHover={!disabled ? { scale: 1.1, transition: { duration: 0.15 } } : {}}
                        whileTap={!disabled ? { scale: 0.95 } : {}}
                      />
                    )}

                    {/* Coordinate labels */}
                    {displayCol === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[0.5rem] opacity-30 font-mono pointer-events-none">
                        {8 - boardRow}
                      </span>
                    )}
                    {displayRow === 7 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[0.5rem] opacity-30 font-mono pointer-events-none">
                        {String.fromCharCode(97 + boardCol)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
