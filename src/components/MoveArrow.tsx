import React from "react";
import { squareToCoords } from "@/data/pieceUnicode";

interface MoveArrowProps {
  from: string;
  to: string;
  flipped?: boolean;
  color?: string;
}

/**
 * SVG arrow overlay drawn on top of the chessboard grid.
 * Coordinates assume an 8×8 grid where each cell is 12.5% wide/tall.
 */
export default function MoveArrow({ from, to, flipped = false, color = "hsl(140, 65%, 45%)" }: MoveArrowProps) {
  const [fromRow, fromCol] = squareToCoords(from);
  const [toRow, toCol] = squareToCoords(to);

  const transform = (row: number, col: number) => {
    const r = flipped ? 7 - row : row;
    const c = flipped ? 7 - col : col;
    return { x: c * 12.5 + 6.25, y: r * 12.5 + 6.25 };
  };

  const start = transform(fromRow, fromCol);
  const end = transform(toRow, toCol);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.1) return null;

  const headLen = 3.5;
  const unitX = dx / len;
  const unitY = dy / len;

  // Shorten arrow so head doesn't overshoot
  const tipX = end.x;
  const tipY = end.y;
  const baseX = end.x - unitX * headLen;
  const baseY = end.y - unitY * headLen;
  const perpX = -unitY;
  const perpY = unitX;

  const arrowHead = [
    `${tipX},${tipY}`,
    `${baseX + perpX * 2.2},${baseY + perpY * 2.2}`,
    `${baseX - perpX * 2.2},${baseY - perpY * 2.2}`,
  ].join(" ");

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={baseX}
        y2={baseY}
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <polygon points={arrowHead} fill={color} opacity="0.85" />
    </svg>
  );
}
