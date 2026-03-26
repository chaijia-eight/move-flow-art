import React, { useMemo } from "react";
import { fenToBoard, PIECE_IMAGES } from "@/data/pieceUnicode";
import type { OpeningTheme } from "@/data/openings";

interface MiniBoardProps {
  fen: string;
  theme: OpeningTheme;
  flipped?: boolean;
  className?: string;
}

export default function MiniBoard({ fen, theme, flipped = false, className = "" }: MiniBoardProps) {
  const board = useMemo(() => fenToBoard(fen), [fen]);

  return (
    <div className={`grid grid-cols-8 rounded overflow-hidden ${className}`} style={{ aspectRatio: "1" }}>
      {Array.from({ length: 8 }, (_, displayRow) =>
        Array.from({ length: 8 }, (_, displayCol) => {
          const boardRow = flipped ? 7 - displayRow : displayRow;
          const boardCol = flipped ? 7 - displayCol : displayCol;
          const piece = board[boardRow][boardCol];
          const isLight = (boardRow + boardCol) % 2 === 0;

          return (
            <div
              key={`${displayRow}-${displayCol}`}
              className="relative flex items-center justify-center"
              style={{
                background: isLight ? theme.boardLight : theme.boardDark,
                aspectRatio: "1",
              }}
            >
              {piece && (
                <img
                  src={PIECE_IMAGES[piece]}
                  alt=""
                  draggable={false}
                  className="w-[80%] h-[80%] object-contain select-none"
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
