// Map from FEN piece char to SVG image path
export const PIECE_IMAGES: Record<string, string> = {
  K: "/pieces/wK.svg", Q: "/pieces/wQ.svg", R: "/pieces/wR.svg",
  B: "/pieces/wB.svg", N: "/pieces/wN.svg", P: "/pieces/wP.svg",
  k: "/pieces/bK.svg", q: "/pieces/bQ.svg", r: "/pieces/bR.svg",
  b: "/pieces/bB.svg", n: "/pieces/bN.svg", p: "/pieces/bP.svg",
};

// Keep legacy PIECES for any remaining usage
export const PIECES: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

export function fenToBoard(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) => {
    const cells: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) cells.push(null);
      } else {
        cells.push(ch);
      }
    }
    return cells;
  });
}

export function squareToCoords(square: string): [number, number] {
  const col = square.charCodeAt(0) - 97;
  const row = 8 - parseInt(square[1]);
  return [row, col];
}

export function coordsToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row);
}
