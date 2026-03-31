import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoveArrow from "@/components/MoveArrow";
import { Chess } from "chess.js";
import { fenToBoard, PIECE_IMAGES, coordsToSquare, squareToCoords } from "@/data/pieceUnicode";
import { useTheme } from "@/contexts/ThemeContext";
import CaptureEffect from "@/components/CaptureEffect";
import { playMoveSound, playCaptureSound, playCastleSound, playCheckSound, playCheckmateSound, playPromoteSound } from "@/lib/chessSounds";
import type { MoveCategory, CustomArrow, CustomHighlight, NagSymbol } from "@/data/openings";
import { NAG_SYMBOLS } from "@/data/openings";

interface ChessboardProps {
  fen: string;
  onMove: (from: string, to: string, san: string) => void;
  moveHints: Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>;
  disabled?: boolean;
  flipped?: boolean;
  playerColor?: "w" | "b";
  arrowFrom?: string;
  arrowTo?: string;
  highlightSquare?: string | null;
  highlightColor?: "gold" | "red";
  customArrows?: CustomArrow[];
  customHighlights?: CustomHighlight[];
  onRightClickDraw?: (type: "arrow", data: { from: string; to: string; color: string }) => void;
  onRightClickSquare?: (square: string) => void;
  /** Map of square -> NagSymbol to show on that piece's corner */
  nagOverlays?: Map<string, NagSymbol>;
}

interface AnimMove {
  from: string;
  to: string;
  isCapture: boolean;
  id: number;
}

interface DragState {
  square: string;
  piece: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

let animIdCounter = 0;

export default function Chessboard({
  fen, onMove, moveHints, disabled, flipped = false, playerColor,
  arrowFrom, arrowTo, highlightSquare, highlightColor = "gold",
  customArrows, customHighlights, onRightClickDraw, onRightClickSquare,
  nagOverlays,
}: ChessboardProps) {
  const { currentTheme } = useTheme();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [animMove, setAnimMove] = useState<AnimMove | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const prevBoardRef = useRef<(string | null)[][] | null>(null);
  const prevFenRef = useRef<string>(fen);
  const boardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const skipNextAnimRef = useRef(false);

  // Right-click arrow drawing state
  const [rightDrag, setRightDrag] = useState<{ from: string; currentSquare: string | null } | null>(null);
  const isRightDraggingRef = useRef(false);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  const board = useMemo(() => fenToBoard(fen), [fen]);
  const chess = useMemo(() => new Chess(fen), [fen]);

  // Detect moves by comparing previous and current board
  useEffect(() => {
    const prevBoard = prevBoardRef.current;
    if (prevBoard && prevFenRef.current !== fen) {
      let fromSquare: string | null = null;
      let toSquare: string | null = null;
      let wasCapture = false;
      let changedCount = 0;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const prev = prevBoard[r][c];
          const curr = board[r][c];
          if (prev !== curr) {
            changedCount++;
            const sq = coordsToSquare(r, c);
            if (prev && !curr) {
              fromSquare = sq;
            } else if (curr && !prev) {
              toSquare = sq;
            } else if (prev && curr && prev !== curr) {
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

      const isCastle = changedCount === 4;
      const isEnPassant = changedCount === 3 && !wasCapture;

      // Detect promotion: a pawn arrived but piece type changed
      let isPromotion = false;
      if (fromSquare && toSquare) {
        const fromPiece = prevBoard[squareToCoords(fromSquare)[0]][squareToCoords(fromSquare)[1]];
        const toPiece = board[squareToCoords(toSquare)[0]][squareToCoords(toSquare)[1]];
        if (fromPiece && toPiece && fromPiece.toLowerCase() === 'p' && toPiece.toLowerCase() !== 'p') {
          isPromotion = true;
        }
      }

      if (fromSquare && toSquare) {
        const skipAnim = skipNextAnimRef.current && !isCastle;
        skipNextAnimRef.current = false;
        if (!skipAnim) {
          setAnimMove({ from: fromSquare, to: toSquare, isCapture: wasCapture || isEnPassant, id: ++animIdCounter });
        }
        setLastMove({ from: fromSquare, to: toSquare });

        // Sound priority: checkmate > check > promotion > capture > castle > move
        const tempChess = new Chess(fen);
        if (tempChess.isCheckmate()) {
          playCheckmateSound();
        } else if (tempChess.inCheck()) {
          playCheckSound();
        } else if (isPromotion) {
          playPromoteSound();
        } else if (wasCapture || isEnPassant) {
          playCaptureSound();
        } else if (isCastle) {
          playCastleSound();
        } else {
          playMoveSound();
        }
      }
    }

    prevBoardRef.current = board.map(row => [...row]);
    prevFenRef.current = fen;
  }, [fen, board]);

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

  const getSquareFromPoint = useCallback((clientX: number, clientY: number): string | null => {
    const boardEl = boardRef.current;
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const displayCol = Math.floor((x / rect.width) * 8);
    const displayRow = Math.floor((y / rect.height) * 8);
    if (displayCol < 0 || displayCol > 7 || displayRow < 0 || displayRow > 7) return null;
    const [boardRow, boardCol] = displayToBoard(displayRow, displayCol);
    return coordsToSquare(boardRow, boardCol);
  }, [flipped]);

  const canInteract = useCallback(() => {
    if (disabled) return false;
    if (playerColor && chess.turn() !== playerColor) return false;
    return true;
  }, [disabled, playerColor, chess]);

  const isOwnPiece = useCallback((piece: string) => {
    return (chess.turn() === "w" && piece === piece.toUpperCase()) ||
           (chess.turn() === "b" && piece === piece.toLowerCase());
  }, [chess]);

  const handleSquareClick = (displayRow: number, displayCol: number) => {
    if (!canInteract()) return;
    if (isDraggingRef.current) return;
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

    if (piece && isOwnPiece(piece)) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleDragStart = useCallback((e: React.PointerEvent, square: string, piece: string) => {
    if (e.button !== 0) return; // Only left-click initiates drag
    if (!canInteract()) return;
    if (!isOwnPiece(piece)) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = false;

    setDragState({
      square,
      piece,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
    setSelectedSquare(square);
  }, [canInteract, isOwnPiece]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (isRightDraggingRef.current && rightDrag) {
      const sq = getSquareFromPoint(e.clientX, e.clientY);
      if (sq !== rightDrag.currentSquare) {
        setRightDrag(prev => prev ? { ...prev, currentSquare: sq } : null);
      }
      return;
    }
    if (!dragState) return;
    e.preventDefault();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (!isDraggingRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      isDraggingRef.current = true;
    }

    setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
  }, [dragState, rightDrag, getSquareFromPoint]);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    e.preventDefault();

    if (isDraggingRef.current) {
      const targetSquare = getSquareFromPoint(e.clientX, e.clientY);
      if (targetSquare && targetSquare !== dragState.square) {
        const legalMoves = getLegalMoves(dragState.square);
        const targetMove = legalMoves.find(m => m.to === targetSquare);
        if (targetMove) {
          skipNextAnimRef.current = true;
          onMove(dragState.square, targetSquare, targetMove.san);
          setSelectedSquare(null);
        }
      }
      setTimeout(() => { isDraggingRef.current = false; }, 0);
    }

    setDragState(null);
  }, [dragState, getSquareFromPoint, getLegalMoves, onMove]);

  // Right-click arrow/highlight handling
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 2) return;
    e.preventDefault();
    const sq = getSquareFromPoint(e.clientX, e.clientY);
    if (!sq) return;
    isRightDraggingRef.current = true;
    setRightDrag({ from: sq, currentSquare: sq });
  }, [getSquareFromPoint]);

  const handleRightMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isRightDraggingRef.current || !rightDrag) return;
    e.preventDefault();
    isRightDraggingRef.current = false;
    const toSq = getSquareFromPoint(e.clientX, e.clientY);

    if (toSq && toSq !== rightDrag.from && onRightClickDraw) {
      // Arrow drawn
      const color = e.shiftKey ? "hsl(0, 70%, 50%)" : e.altKey ? "hsl(45, 90%, 55%)" : e.ctrlKey ? "hsl(210, 70%, 55%)" : "hsl(140, 65%, 45%)";
      onRightClickDraw("arrow", { from: rightDrag.from, to: toSq, color });
    } else if (toSq && toSq === rightDrag.from && onRightClickSquare) {
      // Single square click
      onRightClickSquare(rightDrag.from);
    }
    setRightDrag(null);
  }, [rightDrag, getSquareFromPoint, onRightClickDraw, onRightClickSquare]);

  const activeSquare = dragState?.square ?? selectedSquare;

  const legalTargets = useMemo(() => {
    if (!activeSquare) return new Map<string, MoveCategory>();
    const moves = getLegalMoves(activeSquare);
    const targets = new Map<string, MoveCategory>();
    
    moves.forEach(m => {
      let category: MoveCategory = "mistake";
      const hintForSquare = moveHints.get(activeSquare);
      if (hintForSquare) {
        const bySan = hintForSquare.targets.get(m.san);
        const byTo = hintForSquare.targets.get(m.to);
        if (bySan) category = bySan;
        else if (byTo) category = byTo;
      }
      targets.set(m.to, category);
    });
    
    return targets;
  }, [activeSquare, moveHints, getLegalMoves]);

  const getMoveIndicatorColor = (category: MoveCategory) => {
    switch (category) {
      case "main_line": return currentTheme.accentColor;
      case "legit_alternative": return "hsl(180, 40%, 55%)";
      case "mistake": return "hsl(0, 72%, 50%)";
    }
  };

  const getSlideOffset = (from: string, to: string): { x: string; y: string } => {
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    const [fromDispRow, fromDispCol] = boardToDisplay(fromRow, fromCol);
    const [toDispRow, toDispCol] = boardToDisplay(toRow, toCol);
    const dx = (fromDispCol - toDispCol) * 100;
    const dy = (fromDispRow - toDispRow) * 100;
    return { x: `${dx}%`, y: `${dy}%` };
  };

  const dragGhost = useMemo(() => {
    if (!dragState || !isDraggingRef.current) return null;
    const boardEl = boardRef.current;
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const squareSize = rect.width / 8;
    return {
      piece: dragState.piece,
      x: dragState.currentX - rect.left - squareSize * 0.4,
      y: dragState.currentY - rect.top - squareSize * 0.4,
      size: squareSize * 0.8,
    };
  }, [dragState]);

  // Build highlight set for quick lookup
  const highlightSet = useMemo(() => {
    const m = new Map<string, string>();
    if (customHighlights) {
      for (const h of customHighlights) m.set(h.square, h.color);
    }
    return m;
  }, [customHighlights]);

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
          <div
            ref={boardRef}
            className="grid grid-cols-8 rounded-md overflow-hidden relative touch-none"
            style={{ aspectRatio: "1" }}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onContextMenu={handleContextMenu}
            onMouseDown={handleRightMouseDown}
            onMouseUp={handleRightMouseUp}
          >
            {/* Engine arrow overlay */}
            {arrowFrom && arrowTo && (
              <MoveArrow from={arrowFrom} to={arrowTo} flipped={flipped} />
            )}

            {/* Custom arrows */}
            {customArrows && customArrows.map((a, i) => (
              <MoveArrow key={`ca-${i}`} from={a.from} to={a.to} flipped={flipped} color={a.color} />
            ))}

            {/* Right-drag preview arrow */}
            {rightDrag && rightDrag.currentSquare && rightDrag.currentSquare !== rightDrag.from && (
              <MoveArrow from={rightDrag.from} to={rightDrag.currentSquare} flipped={flipped} color="hsl(140, 65%, 45%)" />
            )}

            {/* Drag ghost piece */}
            {dragGhost && (
              <img
                src={PIECE_IMAGES[dragGhost.piece]}
                alt=""
                className="absolute z-50 pointer-events-none select-none opacity-90"
                style={{
                  left: dragGhost.x,
                  top: dragGhost.y,
                  width: dragGhost.size,
                  height: dragGhost.size,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                }}
              />
            )}

            {Array.from({ length: 8 }, (_, displayRow) =>
              Array.from({ length: 8 }, (_, displayCol) => {
                const [boardRow, boardCol] = displayToBoard(displayRow, displayCol);
                const square = coordsToSquare(boardRow, boardCol);
                const piece = board[boardRow][boardCol];
                const isLight = getSquareColor(boardRow, boardCol) === "light";
                const isSelected = activeSquare === square;
                const isLastMove = lastMove?.from === square || lastMove?.to === square;
                const targetCategory = legalTargets.get(square);
                const isTarget = targetCategory !== undefined;
                const isAnimTo = animMove?.to === square;
                const isCaptureSquare = animMove?.isCapture && animMove?.to === square;
                const isCrucialHighlight = highlightSquare === square;
                const isDragSource = dragState?.square === square && isDraggingRef.current;
                const isDragOver = dragState && isDraggingRef.current
                  ? getSquareFromPoint(dragState.currentX, dragState.currentY) === square
                  : false;
                const customHighlightColor = highlightSet.get(square);

                const slideOffset = isAnimTo && animMove
                  ? getSlideOffset(animMove.from, animMove.to)
                  : null;

                return (
                  <div
                    key={square}
                    className="relative flex items-center justify-center cursor-pointer transition-colors duration-150"
                    style={{
                      background: isDragOver
                        ? `${currentTheme.accentColor}50`
                        : isSelected
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

                    {/* Custom square highlight */}
                    {customHighlightColor && (
                      <div
                        className="absolute inset-0 z-[4] pointer-events-none"
                        style={{ background: customHighlightColor, opacity: 0.4 }}
                      />
                    )}

                    {/* Crucial moment highlight glow */}
                    {isCrucialHighlight && (() => {
                      const hue = highlightColor === "red" ? "0, 72%, 50%" : "45, 100%, 60%";
                      const hueMid = highlightColor === "red" ? "0, 72%, 45%" : "45, 100%, 50%";
                      const hueShadow = highlightColor === "red" ? "0, 72%, 50%" : "45, 100%, 55%";
                      return (
                        <motion.div
                          className="absolute inset-0 z-[5] pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          style={{
                            background: `radial-gradient(circle, hsl(${hue}) 0%, hsl(${hueMid}) 40%, transparent 70%)`,
                            boxShadow: `inset 0 0 20px hsl(${hueShadow}), 0 0 15px hsl(${hueShadow})`,
                          }}
                        />
                      );
                    })()}

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

                    {/* Chess piece */}
                    {piece && (
                      <div className="relative z-20 w-[80%] h-[80%]">
                        <motion.img
                          key={`${square}-${animMove?.id ?? 0}`}
                          src={PIECE_IMAGES[piece]}
                          alt={piece}
                          draggable={false}
                          className="select-none w-full h-full object-contain"
                          style={{
                            cursor: disabled ? "default" : "grab",
                            opacity: isDragSource ? 0.3 : 1,
                          }}
                          initial={slideOffset ? { x: slideOffset.x, y: slideOffset.y } : false}
                          animate={{ x: 0, y: 0 }}
                          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                          whileHover={!disabled ? { scale: 1.1, transition: { duration: 0.15 } } : {}}
                          whileTap={!disabled ? { scale: 0.95 } : {}}
                          onPointerDown={(e) => handleDragStart(e, square, piece)}
                        />
                        {/* NAG overlay on piece corner */}
                        {nagOverlays?.get(square) && (() => {
                          const nag = nagOverlays.get(square)!;
                          const sym = NAG_SYMBOLS.find(s => s.key === nag);
                          if (!sym) return null;
                          return (
                            <img
                              src={sym.icon}
                              alt={sym.label}
                              className="absolute -top-2 -right-2 w-7 h-7 pointer-events-none z-30 drop-shadow-lg"
                            />
                          );
                        })()}
                      </div>
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
