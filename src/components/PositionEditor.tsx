import React, { useCallback, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Trash2 } from "lucide-react";
import { PIECE_IMAGES, fenToBoard, coordsToSquare, squareToCoords } from "@/data/pieceUnicode";

interface PositionEditorProps {
  fen: string;
  onChange: (fen: string) => void;
  turn: "w" | "b";
  onTurnChange: (turn: "w" | "b") => void;
}

const WHITE_PIECES = ["K", "Q", "R", "B", "N", "P"];
const BLACK_PIECES = ["k", "q", "r", "b", "n", "p"];
const EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

/** Build a placement-only FEN from a 2D board, preserving turn/castling-less metadata. */
function boardToFen(board: (string | null)[][], turn: "w" | "b"): string {
  const rows = board
    .map((row) => {
      let s = "";
      let empty = 0;
      for (const cell of row) {
        if (!cell) {
          empty++;
        } else {
          if (empty > 0) {
            s += empty;
            empty = 0;
          }
          s += cell;
        }
      }
      if (empty > 0) s += empty;
      return s;
    })
    .join("/");
  return `${rows} ${turn} - - 0 1`;
}

export default function PositionEditor({ fen, onChange, turn, onTurnChange }: PositionEditorProps) {
  const board = useMemo(() => fenToBoard(fen), [fen]);
  const boardRef = useRef<HTMLDivElement>(null);

  // The currently selected palette piece (or "trash" to remove).
  const [tool, setTool] = useState<string | "trash" | null>(null);
  // Pointer drag state — either dragging from palette (sourceSquare null) or from a board square.
  const [drag, setDrag] = useState<{
    piece: string;
    fromSquare: string | null;
    x: number;
    y: number;
  } | null>(null);

  const setSquare = useCallback(
    (square: string, piece: string | null) => {
      const next = board.map((row) => [...row]);
      const [r, c] = squareToCoords(square);
      next[r][c] = piece;
      onChange(boardToFen(next, turn));
    },
    [board, turn, onChange],
  );

  const moveSquare = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      const next = board.map((row) => [...row]);
      const [fr, fc] = squareToCoords(from);
      const [tr, tc] = squareToCoords(to);
      const piece = next[fr][fc];
      if (!piece) return;
      next[fr][fc] = null;
      next[tr][tc] = piece;
      onChange(boardToFen(next, turn));
    },
    [board, turn, onChange],
  );

  const getSquareFromPoint = (clientX: number, clientY: number): string | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const col = Math.floor((x / rect.width) * 8);
    const row = Math.floor((y / rect.height) * 8);
    return coordsToSquare(row, col);
  };

  const handleSquareClick = (square: string) => {
    if (!tool) return;
    if (tool === "trash") {
      setSquare(square, null);
    } else {
      setSquare(square, tool);
    }
  };

  // --- Drag handlers ---
  const startPaletteDrag = (e: React.PointerEvent, piece: string) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setTool(piece);
    setDrag({ piece, fromSquare: null, x: e.clientX, y: e.clientY });
  };

  const startBoardDrag = (e: React.PointerEvent, square: string, piece: string) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ piece, fromSquare: square, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const sq = getSquareFromPoint(e.clientX, e.clientY);
    if (sq) {
      if (drag.fromSquare) {
        moveSquare(drag.fromSquare, sq);
      } else {
        setSquare(sq, drag.piece);
      }
    } else if (drag.fromSquare) {
      // Dropped off-board → remove the piece.
      setSquare(drag.fromSquare, null);
    }
    setDrag(null);
  };

  // --- Validation: each side must have exactly one king ---
  const flat = board.flat();
  const whiteKings = flat.filter((p) => p === "K").length;
  const blackKings = flat.filter((p) => p === "k").length;
  const valid = whiteKings === 1 && blackKings === 1;

  let validationMsg: string | null = null;
  if (whiteKings === 0) validationMsg = "Add a white king.";
  else if (blackKings === 0) validationMsg = "Add a black king.";
  else if (whiteKings > 1) validationMsg = "Only one white king allowed.";
  else if (blackKings > 1) validationMsg = "Only one black king allowed.";
  else {
    // Try chess.js for full legality (won't throw if turn-neutral kings aren't in check).
    try {
      // eslint-disable-next-line no-new
      new Chess(fen);
    } catch (e: any) {
      validationMsg = e?.message ?? "Invalid position.";
    }
  }

  return (
    <div
      className="space-y-3"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Palette: black on top, white on bottom — matches board orientation. */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {BLACK_PIECES.map((p) => (
            <PaletteButton
              key={p}
              piece={p}
              active={tool === p}
              onSelect={() => setTool(p)}
              onPointerDown={(e) => startPaletteDrag(e, p)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTool(tool === "trash" ? null : "trash")}
          className={`h-9 w-9 rounded-md flex items-center justify-center border ${
            tool === "trash"
              ? "bg-destructive/20 border-destructive text-destructive"
              : "bg-secondary border-border text-foreground hover:bg-secondary/80"
          }`}
          title="Remove piece"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={boardRef}
        className="grid grid-cols-8 rounded-md overflow-hidden border border-border touch-none select-none"
        style={{ aspectRatio: "1" }}
      >
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const square = coordsToSquare(r, c);
            const piece = board[r][c];
            const isLight = (r + c) % 2 === 0;
            const hidden = drag?.fromSquare === square;
            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onPointerDown={(e) => {
                  if (piece && !tool) startBoardDrag(e, square, piece);
                }}
                className={`relative flex items-center justify-center cursor-pointer ${
                  isLight ? "bg-[hsl(45,30%,82%)]" : "bg-[hsl(28,35%,40%)]"
                }`}
              >
                {piece && !hidden && (
                  <img
                    src={PIECE_IMAGES[piece]}
                    alt={piece}
                    draggable={false}
                    className="w-[88%] h-[88%] pointer-events-none"
                  />
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Drag ghost */}
      {drag && (
        <img
          src={PIECE_IMAGES[drag.piece]}
          alt=""
          className="fixed z-50 pointer-events-none w-12 h-12 opacity-90"
          style={{
            left: drag.x - 24,
            top: drag.y - 24,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
          }}
        />
      )}

      {/* White palette */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {WHITE_PIECES.map((p) => (
            <PaletteButton
              key={p}
              piece={p}
              active={tool === p}
              onSelect={() => setTool(p)}
              onPointerDown={(e) => startPaletteDrag(e, p)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Turn:</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => onTurnChange("w")}
              className={`px-2 h-8 text-xs ${
                turn === "w" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              White
            </button>
            <button
              type="button"
              onClick={() => onTurnChange("b")}
              className={`px-2 h-8 text-xs ${
                turn === "b" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              Black
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FEN)}
            className="h-8 px-2 rounded-md bg-secondary text-xs text-foreground hover:bg-secondary/80"
          >
            Clear
          </button>
        </div>
      </div>

      <p className={`text-xs ${valid && !validationMsg ? "text-muted-foreground" : "text-destructive"}`}>
        {validationMsg ??
          (tool && tool !== "trash"
            ? `Click squares to place ${tool}. Drag pieces on the board to move them.`
            : "Pick a piece, then click a square. Drag a board piece to move or drag it off to remove.")}
      </p>
    </div>
  );
}

function PaletteButton({
  piece,
  active,
  onSelect,
  onPointerDown,
}: {
  piece: string;
  active: boolean;
  onSelect: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onPointerDown={onPointerDown}
      className={`h-10 w-10 rounded-md flex items-center justify-center border transition-colors ${
        active
          ? "bg-primary/15 border-primary"
          : "bg-secondary border-border hover:bg-secondary/80"
      }`}
    >
      <img src={PIECE_IMAGES[piece]} alt={piece} draggable={false} className="w-8 h-8 pointer-events-none" />
    </button>
  );
}